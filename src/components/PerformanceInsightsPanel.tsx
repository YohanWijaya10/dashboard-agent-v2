import React from 'react';
import { Sparkles, RefreshCw, Info } from 'lucide-react';
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

  const topStrong = React.useMemo(() => {
    if (!productList.length) return [] as string[];
    const sorted = [...productList].sort((a, b) => (b.revenuePotential || 0) - (a.revenuePotential || 0));
    return sorted.slice(0, 2).map(p => `${p.productName} (${p.sku})`);
  }, [productList]);

  const improvementCandidates = React.useMemo(() => {
    if (!productList.length) return [] as string[];
    const revenues = productList.map(p => p.revenuePotential).sort((a, b) => a - b);
    const issued = productList.map(p => p.totalIssued30Days).sort((a, b) => a - b);
    const median = (arr: number[]) => arr.length ? arr[Math.floor(arr.length / 2)] : 0;
    const medRevenue = median(revenues);
    const medIssued = median(issued);
    const filtered = productList
      .filter(p => (p.totalIssued30Days || 0) >= medIssued && (p.revenuePotential || 0) < medRevenue)
      .sort((a, b) => (b.totalIssued30Days || 0) - (a.totalIssued30Days || 0))
      .slice(0, 3)
      .map(p => `${p.productName} (${p.sku})`);
    return filtered;
  }, [productList]);

  // Build ranking sets for evidence text without showing numbers
  const rankingSets = React.useMemo(() => {
    const byRevenueDesc = [...productList].sort((a, b) => (b.revenuePotential || 0) - (a.revenuePotential || 0));
    const byIssuedDesc = [...productList].sort((a, b) => (b.totalIssued30Days || 0) - (a.totalIssued30Days || 0));
    const topRev = new Set(byRevenueDesc.slice(0, 10).map(p => p.sku));
    const topVel = new Set(byIssuedDesc.slice(0, 10).map(p => p.sku));

    const byRevenueAsc = [...productList].sort((a, b) => (a.revenuePotential || 0) - (b.revenuePotential || 0));
    const byIssuedAsc = [...productList].sort((a, b) => (a.totalIssued30Days || 0) - (b.totalIssued30Days || 0));
    const q = Math.max(1, Math.floor(productList.length / 4));
    const bottomRev = new Set(byRevenueAsc.slice(0, q).map(p => p.sku));
    const bottomVel = new Set(byIssuedAsc.slice(0, q).map(p => p.sku));
    const lowBoth = productList
      .filter(p => bottomRev.has(p.sku) && bottomVel.has(p.sku))
      .slice(0, 2)
      .map(p => `${p.productName} (${p.sku})`);

    return { topRev, topVel, lowBoth };
  }, [productList]);
  return (
    <div className="card mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold">AI Performance Insights</h3>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Refresh insights"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-gray-400">
            Generating AI insights...
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium mb-1">Failed to generate insights</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {insights && !loading && !error && (
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Insight Utama</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              Portofolio masih bertumpu pada beberapa produk utama; sisanya kontribusinya lebih rendah.
              Peluang: dorong produk yang diminati agar menghasilkan lebih baik, dan kurangi risiko ketergantungan.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Produk Unggulan</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {(() => {
                const list = topStrong.length ? topStrong : (insights.topPerformers || []).slice(0, 2);
                if (!list.length) {
                  return 'Beberapa produk konsisten laku dan bernilai. Pastikan ketersediaan dan pertahankan posisi harga.';
                }
                return `${list.join(', ')} konsisten laku dan bernilai. Pastikan ketersediaan, pertahankan harga, dan pertimbangkan varian/upsell.`;
              })()}
            </p>
            {productList.length > 0 && (() => {
              const skus = new Set(
                (topStrong as string[]).map(s => {
                  const m = s.match(/\(([^)]+)\)$/);
                  return m ? m[1] : s;
                })
              );
              const inRev = [...skus].some(sku => rankingSets.topRev.has(sku));
              const inVel = [...skus].some(sku => rankingSets.topVel.has(sku));
              let text: string | null = null;
              if (inRev && inVel) text = "Bukti: tampil di 'Produk Paling Menghasilkan' dan 'Produk Paling Cepat Laku'.";
              else if (inRev) text = "Bukti: tampil di ranking 'Produk Paling Menghasilkan'.";
              else if (inVel) text = "Bukti: tampil di ranking 'Produk Paling Cepat Laku'.";
              if (!text) return null;
              return (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs">
                    <Info className="w-3 h-3" />
                    {text}
                  </span>
                </div>
              );
            })()}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Butuh Perbaikan</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {improvementCandidates.length
                ? `${improvementCandidates.join(', ')} cepat laku namun nilai per unit belum optimal. Fokus pada kenaikan margin melalui penyesuaian harga, bundling, atau cross‑sell.`
                : 'Ada produk yang perputarannya baik namun nilainya belum optimal. Fokus pada kenaikan margin melalui penyesuaian harga, bundling, atau cross‑sell.'}
            </p>
            {improvementCandidates.length > 0 && (
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs">
                  <Info className="w-3 h-3" />
                  {"Bukti: muncul di 'Produk Paling Cepat Laku' tetapi tidak di 'Produk Paling Menghasilkan'; indikasi nilai per unit/margin rendah."}
                </span>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Perlu Tindakan</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {(() => {
                const bottomByData = rankingSets.lowBoth;
                const fallback = insights.bottomPerformers || [];
                const list = (bottomByData.length ? bottomByData : fallback.slice(0, 2));
                if (!list.length) return 'Identifikasi produk dengan kontribusi rendah untuk direposisi atau di‑phase out bila tidak ada perbaikan.';
                return `${list.join(', ')} menunjukkan kontribusi rendah. Evaluasi reposisi harga/biaya atau pertimbangkan phase‑out.`;
              })()}
            </p>
            {(rankingSets.lowBoth.length > 0) && (
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs">
                  <Info className="w-3 h-3" />
                  {"Bukti: tidak muncul di dua ranking utama dan berada pada kelompok terbawah kontribusi 30 hari."}
                </span>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Prioritas</h4>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
              <li>Naikkan margin produk laku tapi nilai rendah (uji harga, bundling, cross‑sell).</li>
              <li>Amankan suplai produk unggulan dan pertahankan kualitas layanan.</li>
              <li>Tetapkan keputusan reposisi atau phase‑out untuk produk lemah dalam 1 kuartal.</li>
            </ul>
          </div>

          <div className="mt-2 pt-3 border-t text-xs text-gray-500">
            Generated at: {new Date(insights.generatedAt).toLocaleString('id-ID')}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceInsightsPanel;
