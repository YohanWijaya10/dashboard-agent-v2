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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Performance Data
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <TrendingUp className="w-6 h-6 text-primary-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">
            Product Performance Analysis
          </h2>
        </div>
        <span className="text-sm text-gray-500">30-day analysis</span>
      </div>

      {/* AI Insights Panel */}
      <PerformanceInsightsPanel
        insights={insights}
        loading={loading}
        error={error}
        onRefresh={refresh}
      />

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
        <h3 className="text-lg font-semibold mb-4">💰 Produk Paling Menghasilkan (30 Hari)</h3>
        <div className="h-80 md:h-96">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-gray-400 animate-pulse">
              Loading chart...
            </div>
          ) : topRevenue.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
              No data available
            </div>
          ) : (
            <ReactECharts option={revenueOption} style={{ height: '100%', width: '100%' }} />
          )}
        </div>
      </div>

      {/* Helper Text */}
      <ul className="text-sm text-gray-600 list-disc list-inside">
        <li>Cepat laku tapi revenue rendah → naikkan margin</li>
        <li>Revenue tinggi tapi jarang laku → promo/bundling</li>
      </ul>

      {/* Chart B: Velocity Ranking */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">⚡ Produk Paling Cepat Laku (30 Hari)</h3>
        <div className="h-80 md:h-96">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-gray-400 animate-pulse">
              Loading chart...
            </div>
          ) : topVelocity.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
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
