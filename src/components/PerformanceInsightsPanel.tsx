import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import type { ProductPerformanceInsightResponse, ProductPerformanceData } from '../types';

interface Props {
  insights: ProductPerformanceInsightResponse | null;
  loading?: boolean;
  error?: string | null;
  onRefresh: () => void;
  products?: ProductPerformanceData[];
}

const PerformanceInsightsPanel: React.FC<Props> = ({
  insights,
  loading,
  error,
  onRefresh,
  products
}) => {
  const productList = Array.isArray(products) ? products : [];

  // Helpers to derive qualitative labels (no numeric output in UI)
  const median = (arr: number[]) => (arr.length ? arr[Math.floor(arr.length / 2)] : 0);
  const getUnitValue = (p: ProductPerformanceData) => {
    const issued = Math.max(1, p.totalIssued30Days || 0);
    return (p.revenuePotential || 0) / issued;
  };
  const getUnitStatus = (p: ProductPerformanceData) => {
    const unitVal = getUnitValue(p);
    const cost = p.latestUnitCost || 0;
    if (unitVal < cost * 0.98) return 'below_cost' as const; // clearly below cost
    if (unitVal < cost * 1.1) return 'thin' as const; // near cost → thin margin
    return 'healthy' as const;
  };

  const medIssued = React.useMemo(() => {
    const arr = [...productList.map(p => p.totalIssued30Days || 0)].sort((a, b) => a - b);
    return median(arr);
  }, [productList]);

  const topStrongProducts = React.useMemo(() => {
    if (!productList.length) return [] as ProductPerformanceData[];
    const sorted = [...productList].sort((a, b) => (b.revenuePotential || 0) - (a.revenuePotential || 0));
    return sorted.slice(0, 2);
  }, [productList]);

  const improvementProducts = React.useMemo(() => {
    if (!productList.length) return [] as ProductPerformanceData[];
    return productList
      .filter(p => (p.totalIssued30Days || 0) >= medIssued && getUnitStatus(p) !== 'healthy')
      .sort((a, b) => (b.totalIssued30Days || 0) - (a.totalIssued30Days || 0))
      .slice(0, 3);
  }, [productList, medIssued]);

  const lowContributionProducts = React.useMemo(() => {
    if (!productList.length) return [] as ProductPerformanceData[];
    const byRevenueAsc = [...productList].sort((a, b) => (a.revenuePotential || 0) - (b.revenuePotential || 0));
    const byIssuedAsc = [...productList].sort((a, b) => (a.totalIssued30Days || 0) - (b.totalIssued30Days || 0));
    const q = Math.max(1, Math.floor(productList.length / 4));
    const bottomRev = new Set(byRevenueAsc.slice(0, q).map(p => p.sku));
    const bottomVel = new Set(byIssuedAsc.slice(0, q).map(p => p.sku));
    return productList.filter(p => bottomRev.has(p.sku) && bottomVel.has(p.sku)).slice(0, 2);
  }, [productList]);
  return (
    <div className="card mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-semibold tracking-tight text-slate-900">AI Performance Insights</h3>
          <span className="ai-badge">AI Generated</span>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="ai-icon-btn disabled:opacity-50"
          aria-label="Refresh insights"
        >
          <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="h-2 rounded-md bg-gradient-to-r from-indigo-500/10 to-blue-500/10 mb-4"></div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-slate-400">
            Generating AI insights...
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-rose-700">
          <p className="font-medium mb-1">Failed to generate insights</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {insights && !loading && !error && (
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1">Insight Utama</h4>
            <p className="text-slate-700 text-sm leading-relaxed">
              Portofolio masih bertumpu pada beberapa produk utama; sisanya kontribusinya lebih rendah.
              Peluang: dorong produk yang diminati agar menghasilkan lebih baik, dan kurangi risiko ketergantungan.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1">Produk Unggulan</h4>
            <p className="text-slate-700 text-sm leading-relaxed">
              {(() => {
                const list = (topStrongProducts.length
                  ? topStrongProducts
                  : (insights.topPerformers || []).slice(0, 2).map(name => ({ productName: name, sku: '' } as any))
                );
                if (!list.length) {
                  return 'Beberapa produk konsisten laku dan bernilai. Pastikan ketersediaan dan pertahankan posisi harga.';
                }
                const names = list.map(p => `${p.productName} (${p.sku || 'SKU'})`).join(', ');
                const salesStable = list.every(p => (p.totalIssued30Days || 0) >= medIssued);
                const unitStatuses = list.map(getUnitStatus);
                let unitPhrase = 'Nilai per unitnya berada di atas biaya unit, sehingga margin terjaga.';
                if (unitStatuses.some(s => s === 'below_cost')) {
                  unitPhrase = 'Sebagian nilainya di bawah biaya unit; diperlukan penyesuaian harga atau perbaikan biaya agar margin tetap terjaga.';
                } else if (unitStatuses.some(s => s === 'thin')) {
                  unitPhrase = 'Nilai per unit cenderung tipis; jaga harga dan efisiensi agar margin stabil.';
                }
                const salesPhrase = salesStable ? 'stabil laku' : 'laku';
                return `${names} menyumbang pendapatan besar dan ${salesPhrase}. ${unitPhrase} Pastikan ketersediaan, pertahankan harga, dan pertimbangkan varian/upsell.`;
              })()}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1">Butuh Perbaikan</h4>
            <p className="text-slate-700 text-sm leading-relaxed">
              {improvementProducts.length
                ? `${improvementProducts.map(p => `${p.productName} (${p.sku})`).join(', ')} cepat terjual, namun nilai per unitnya tipis dibanding biaya; indikasi harga bersih terlalu rendah atau biaya unit tinggi. Fokus pada kenaikan margin melalui penyesuaian harga, bundling, atau cross‑sell.`
                : 'Ada produk yang perputarannya baik namun nilainya belum optimal—nilai per unit cenderung tipis terhadap biaya. Fokus pada kenaikan margin melalui penyesuaian harga, bundling, atau cross‑sell.'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1">Perlu Tindakan</h4>
            <p className="text-slate-700 text-sm leading-relaxed">
              {(() => {
                const list = lowContributionProducts.length
                  ? lowContributionProducts
                  : (insights.bottomPerformers || []).slice(0, 2).map(name => ({ productName: name, sku: '' } as any));
                if (!list.length) return 'Identifikasi produk dengan kontribusi rendah untuk direposisi atau di‑phase out bila tidak ada perbaikan.';
                const names = list.map(p => `${p.productName} (${p.sku || 'SKU'})`).join(', ');
                const anyBelowCost = list.some(p => getUnitStatus(p) === 'below_cost');
                const add = anyBelowCost
                  ? ' Nilai per unit berada di bawah biaya; segera evaluasi harga/biaya.'
                  : '';
                return `${names} menunjukkan kontribusi rendah—permintaan kecil dan menyerap modal/ruang tanpa imbal hasil memadai.${add} Evaluasi reposisi harga/biaya atau pertimbangkan phase‑out.`;
              })()}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1">Prioritas</h4>
            <ul className="list-disc list-inside text-slate-700 text-sm space-y-1">
              <li>Naikkan margin produk laku tapi nilai rendah (uji harga, bundling, cross‑sell).</li>
              <li>Amankan suplai produk unggulan dan pertahankan kualitas layanan.</li>
              <li>Tetapkan keputusan reposisi atau phase‑out untuk produk lemah dalam 1 kuartal.</li>
            </ul>
          </div>

          <div className="mt-2 pt-3 border-t border-slate-200 text-xs text-slate-500">
            Generated at: {new Date(insights.generatedAt).toLocaleString('id-ID')}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceInsightsPanel;
