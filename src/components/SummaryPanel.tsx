import React, { useMemo } from 'react';
import { Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SummaryPanelProps {
  summary: string | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ summary, loading, error, onRefresh }) => {
  const transformed = useMemo(() => {
    if (!summary) return '';
    const lines = summary.split(/\r?\n/);
    const findAmount = () => {
      const m = summary.match(/Pending PO[^\d]*Rp\s*[\d\.,]+/i);
      return m ? m[0].replace(/.*?(Rp\s*[\d\.,]+)/i, '$1') : null;
    };
    const amount = findAmount();
    const startIdx = lines.findIndex(l => /^(\s*🎯\s*)?Tindakan\s+Segera/i.test(l));
    if (startIdx === -1) return summary;
    // find next heading or end
    let endIdx = lines.length;
    for (let i = startIdx + 1; i < lines.length; i++) {
      if (/^\s*[#]|^(\s*[📊⚠️🎯💡])\s|^\s*Insight\s|^\s*Produk\s|^\s*Butuh\s|^\s*Perlu\s/i.test(lines[i])) {
        endIdx = i;
        break;
      }
    }
    const before = lines.slice(0, startIdx);
    const after = lines.slice(endIdx);
    const header = '🎯 Tindakan Segera';
    const bullets = [
      `- Siapkan penerimaan dan rencana kas untuk Pending PO${amount ? ` ${amount}` : ''}; pastikan kapasitas gudang mencukupi.`,
      '- Selaraskan definisi “Upcoming PO” (mis. 7–14 hari) dan tampilkan hitungan akurat.',
      '- Lanjutkan analisis harga vs biaya untuk peluang kenaikan margin produk aktif.'
    ];
    const replacement = [header, '', ...bullets, ''];
    return [...before, ...replacement, ...after].join('\n');
  }, [summary]);
  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8 animate-pulse">
        <div className="h-8 bg-blue-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 bg-blue-100 rounded w-full"></div>
          <div className="h-4 bg-blue-100 rounded w-5/6"></div>
          <div className="h-4 bg-blue-100 rounded w-4/5"></div>
          <div className="h-6 bg-blue-200 rounded w-1/4 mt-6"></div>
          <div className="h-4 bg-blue-100 rounded w-full"></div>
          <div className="h-4 bg-blue-100 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-2">Gagal Membuat Ringkasan</h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <button
              onClick={onRefresh}
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Summary content
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-600 rounded-lg p-8 mb-8 shadow-md">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center">
          <Sparkles className="w-6 h-6 text-indigo-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Ringkasan Eksekutif AI</h2>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
          title="Refresh summary"
        >
          <RefreshCw className="w-5 h-5 text-gray-600 hover:text-indigo-600" />
        </button>
      </div>

      <div className="prose prose-indigo max-w-none">
        <ReactMarkdown
          components={{
            h3: ({ children }) => (
              <h3 className="text-lg font-bold text-indigo-900 mt-6 mb-3 first:mt-0 flex items-center">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 leading-relaxed mb-4 text-base">
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-indigo-800">
                {children}
              </strong>
            ),
          }}
        >
          {transformed}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default SummaryPanel;
