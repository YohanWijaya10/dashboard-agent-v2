import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import type { ProductPerformanceInsightResponse } from '../types';

interface Props {
  insights: ProductPerformanceInsightResponse | null;
  loading?: boolean;
  error?: string | null;
  onRefresh: () => void;
}

const PerformanceInsightsPanel: React.FC<Props> = ({
  insights,
  loading,
  error,
  onRefresh
}) => {
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
                const top = insights.topPerformers || [];
                if (top.length === 0) {
                  return 'Beberapa produk konsisten laku dan bernilai. Pastikan ketersediaan dan pertahankan posisi harga.';
                }
                const list = top.slice(0, 2).join(', ');
                return `${list} konsisten laku dan bernilai. Pastikan ketersediaan, pertahankan harga, dan pertimbangkan varian/upsell.`;
              })()}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Butuh Perbaikan</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              Ada produk yang perputarannya baik namun nilainya belum optimal. Fokus pada kenaikan margin melalui penyesuaian harga,
              bundling, atau cross‑sell.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Perlu Tindakan</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {(() => {
                const bottom = insights.bottomPerformers || [];
                if (bottom.length === 0) {
                  return 'Identifikasi produk dengan kontribusi rendah untuk direposisi atau di‑phase out bila tidak ada perbaikan.';
                }
                const list = bottom.slice(0, 2).join(', ');
                return `${list} menunjukkan kontribusi rendah. Evaluasi reposisi harga/biaya atau pertimbangkan phase‑out.`;
              })()}
            </p>
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
