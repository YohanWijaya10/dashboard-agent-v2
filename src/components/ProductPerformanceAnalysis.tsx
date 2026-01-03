import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { useProductPerformance } from '../hooks/useProductPerformance';
import PerformanceSummaryCards from './PerformanceSummaryCards';
import PerformanceInsightsPanel from './PerformanceInsightsPanel';
import ReactECharts from 'echarts-for-react';

const ProductPerformanceAnalysis: React.FC = () => {
  const { performance, insights, loading, error, refresh } = useProductPerformance(
    undefined,
    undefined,
    true
  );

  if (error && !performance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">
            Error Loading Performance Data
          </h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button onClick={refresh} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Data and transforms for ranking charts
  const products = performance?.products || [];

  const topRevenue = useMemo(() => {
    const sorted = [...products].sort(
      (a, b) => (b.revenuePotential || 0) - (a.revenuePotential || 0)
    );
    return sorted.slice(0, 10);
  }, [products]);

  const topVelocity = useMemo(() => {
    const sorted = [...products].sort(
      (a, b) => (b.totalIssued30Days || 0) - (a.totalIssued30Days || 0)
    );
    return sorted.slice(0, 10);
  }, [products]);

  const revenueOption = useMemo(() => {
    const names = topRevenue.map(p => p.productName);
    const seriesData = topRevenue.map(p => ({
      name: p.productName,
      sku: p.sku,
      value: p.revenuePotential,
    }));
    return {
      color: ['#3b82f6'],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          const d = p?.data || {};
          const name = d.name || p?.axisValue || '';
          const sku = d.sku || '-';
          const val = Number(d.value ?? 0);
          return `${name}\nSKU: ${sku}\nRevenue Potential: Rp ${val.toLocaleString('id-ID')}`.replace(/\n/g, '<br/>');
        }
      },
      grid: { left: '20%', right: '4%', bottom: 20, top: 10, containLabel: true },
      xAxis: { type: 'value' },
      yAxis: {
        type: 'category',
        data: names,
      },
      series: [
        {
          name: 'Revenue Potential',
          type: 'bar',
          data: seriesData,
          barMaxWidth: 28,
          emphasis: { focus: 'series' }
        }
      ]
    } as any;
  }, [topRevenue]);

  const velocityOption = useMemo(() => {
    const items = topVelocity.map(p => ({
      label: p.productName,
      sku: p.sku,
      value: p.totalIssued30Days,
      turnoverRate: p.turnoverRate,
    }));
    return {
      color: ['#10b981'],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          const d = p?.data || {};
          const name = d.label || p?.axisValue || '';
          const qty = Number(d.value ?? p?.data ?? 0);
          const sku = d.sku || '-';
          const t = Number(d.turnoverRate ?? 0);
          return `${name} • ${sku}<br/>Issued: ${qty.toLocaleString('id-ID')} unit • Turnover: ${t.toFixed(2)}`;
        }
      },
      grid: { left: '20%', right: '4%', bottom: 20, top: 10, containLabel: true },
      xAxis: { type: 'value', name: 'Issued (units)' },
      yAxis: {
        type: 'category',
        data: items.map(i => i.label),
      },
      series: [
        {
          name: 'Issued (30d)',
          type: 'bar',
          data: items.map(i => ({ value: i.value, label: i.label, sku: i.sku, turnoverRate: i.turnoverRate })),
          barMaxWidth: 28,
          emphasis: { focus: 'series' }
        }
      ]
    } as any;
  }, [topVelocity]);

  // Category cards: derive qualitative reasons and examples without exposing raw numbers
  const median = (arr: number[]) => (arr.length ? arr[Math.floor(arr.length / 2)] : 0);
  const medianIssued = useMemo(() => {
    const arr = [...products.map(p => p.totalIssued30Days || 0)].sort((a, b) => a - b);
    return median(arr);
  }, [products]);

  const unitValue = (p: any) => {
    const issued = Math.max(1, p.totalIssued30Days || 0);
    return (p.revenuePotential || 0) / issued;
  };
  const unitStatus = (p: any) => {
    const uv = unitValue(p);
    const cost = p.latestUnitCost || 0;
    if (uv < cost * 0.98) return 'below_cost' as const;
    if (uv < cost * 1.1) return 'thin' as const;
    return 'healthy' as const;
  };

  const byCategory = useMemo(() => {
    const g: Record<string, typeof products> = { Star: [], 'Cash Cow': [], 'Question Mark': [], Dog: [] } as any;
    products.forEach(p => {
      if (g[p.performanceCategory]) g[p.performanceCategory].push(p);
    });
    return g;
  }, [products]);

  const pickTopByRevenue = (arr: typeof products, n = 2) =>
    [...arr].sort((a, b) => (b.revenuePotential || 0) - (a.revenuePotential || 0)).slice(0, n);

  const pickQM = useMemo(() => {
    const qm = byCategory['Question Mark'] || [];
    const filtered = qm
      .filter(p => (p.totalIssued30Days || 0) >= medianIssued && unitStatus(p) !== 'healthy')
      .sort((a, b) => (b.totalIssued30Days || 0) - (a.totalIssued30Days || 0));
    return (filtered.length ? filtered : qm).slice(0, 3);
  }, [byCategory, medianIssued]);

  const pickDogs = useMemo(() => {
    const dogs = byCategory['Dog'] || [];
    if (!dogs.length) return [] as typeof products;
    const byRev = [...dogs].sort((a, b) => (a.revenuePotential || 0) - (b.revenuePotential || 0));
    const byIss = [...dogs].sort((a, b) => (a.totalIssued30Days || 0) - (b.totalIssued30Days || 0));
    const lowSet = new Set(byRev.slice(0, Math.max(1, Math.floor(dogs.length / 2))).map(p => p.sku));
    const pick = byIss.filter(p => lowSet.has(p.sku)).slice(0, 3);
    return pick.length ? pick : byRev.slice(0, 3);
  }, [byCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <TrendingUp className="w-6 h-6 text-indigo-600 mr-2" />
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Product Performance Analysis
          </h2>
        </div>
        <span className="text-xs text-slate-500">30-day analysis</span>
      </div>

      {/* AI Insights Panel */}
      <PerformanceInsightsPanel
        insights={insights}
        loading={loading}
        error={error}
        onRefresh={refresh}
        products={performance?.products || []}
      />

      {/* Category Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stars */}
        <div className="card">
          <h3 className="text-base font-semibold tracking-tight text-slate-900 mb-2">Stars</h3>
          <p className="text-sm text-slate-700 mb-2">
            Produk penyumbang pendapatan besar dan stabil laku. Nilai per unit berada di atas biaya unit sehingga margin terjaga.
          </p>
          <p className="text-sm text-slate-600 mb-3">
            Contoh: {pickTopByRevenue(byCategory['Star'] || [], 3).map(p => `${p.productName} (${p.sku})`).join(', ') || '-'}
          </p>
          <ul className="text-sm text-slate-700 list-disc list-inside">
            <li>Amankan suplai dan jaga service level.</li>
            <li>Pertahankan harga; uji varian/upsell.</li>
          </ul>
        </div>

        {/* Cash Cows */}
        <div className="card">
          <h3 className="text-base font-semibold tracking-tight text-slate-900 mb-2">Cash Cows</h3>
          <p className="text-sm text-slate-700 mb-2">
            Pendapatan kuat dan stabil; cocok untuk optimasi margin/biaya sambil menjaga arus kas.
          </p>
          <p className="text-sm text-slate-600 mb-3">
            Contoh: {pickTopByRevenue(byCategory['Cash Cow'] || [], 3).map(p => `${p.productName} (${p.sku})`).join(', ') || '-'}
          </p>
          <ul className="text-sm text-slate-700 list-disc list-inside">
            <li>Optimasi biaya dan efisiensi suplai.</li>
            <li>Alokasikan surplus untuk mendanai pertumbuhan.</li>
          </ul>
        </div>

        {/* Question Marks */}
        <div className="card">
          <h3 className="text-base font-semibold tracking-tight text-slate-900 mb-2">Question Marks</h3>
          <p className="text-sm text-slate-700 mb-2">
            Laku cepat, namun nilai per unit tipis (harga bersih relatif rendah atau biaya unit tinggi). Kandidat untuk dinaikkan nilainya.
          </p>
          <p className="text-sm text-slate-600 mb-3">
            Contoh: {pickQM.map(p => `${p.productName} (${p.sku})`).join(', ') || '-'}
          </p>
          <ul className="text-sm text-slate-700 list-disc list-inside">
            <li>Uji kenaikan harga 5–10% atau bundling.</li>
            <li>Cross‑sell untuk menaikkan nilai per transaksi.</li>
          </ul>
        </div>

        {/* Dogs (renamed for clarity) */}
        <div className="card">
          <h3 className="text-base font-semibold tracking-tight text-slate-900 mb-2">Performa Rendah</h3>
          <p className="text-sm text-slate-700 mb-2">
            Permintaan rendah dan kontribusi kecil; berisiko menyerap modal/ruang tanpa imbal hasil memadai.
          </p>
          <p className="text-sm text-slate-600 mb-3">
            Contoh: {pickDogs.map(p => `${p.productName} (${p.sku})`).join(', ') || '-'}
          </p>
          <ul className="text-sm text-slate-700 list-disc list-inside">
            <li>Audit harga/biaya/kompetitor untuk reposisi.</li>
            <li>Phase‑out bertahap bila tidak membaik.</li>
          </ul>
        </div>
      </div>

      {/* Summary Cards */}
      <PerformanceSummaryCards
        summary={performance?.summary || {
          stars: 0,
          cashCows: 0,
          questionMarks: 0,
          dogs: 0,
          medianTurnover: 0,
          medianRevenue: 0
        }}
        loading={loading}
      />

      {/* Chart A: Revenue Potential Ranking */}
      <div className="card">
        <h3 className="text-base font-semibold tracking-tight text-slate-900 mb-4">💰 Produk Paling Menghasilkan (30 Hari)</h3>
        <div className="h-80 md:h-96">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-slate-400 animate-pulse">
              Loading chart...
            </div>
          ) : topRevenue.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-slate-400">
              No data available
            </div>
          ) : (
            <ReactECharts option={revenueOption} style={{ height: '100%', width: '100%' }} />
          )}
        </div>
      </div>

      {/* Helper Text */}
      <ul className="text-xs text-slate-500 list-disc list-inside">
        <li>Cepat laku tapi revenue rendah → naikkan margin</li>
        <li>Revenue tinggi tapi jarang laku → promo/bundling</li>
      </ul>

      {/* Chart B: Velocity Ranking */}
      <div className="card">
        <h3 className="text-base font-semibold tracking-tight text-slate-900 mb-4">⚡ Produk Paling Cepat Laku (30 Hari)</h3>
        <div className="h-80 md:h-96">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-slate-400 animate-pulse">
              Loading chart...
            </div>
          ) : topVelocity.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-slate-400">
              No data available
            </div>
          ) : (
            <ReactECharts option={velocityOption} style={{ height: '100%', width: '100%' }} />
          )}
        </div>
      </div>

      {/* TODO: Add PerformanceTables component here */}
      {/* TODO: Add PerformanceDataTable component here */
      }
    </div>
  );
};

export default ProductPerformanceAnalysis;
