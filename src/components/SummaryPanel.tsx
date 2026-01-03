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
      <div className="card animate-pulse mb-8">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-4 bg-slate-100 rounded w-5/6"></div>
          <div className="h-4 bg-slate-100 rounded w-4/5"></div>
          <div className="h-6 bg-slate-200 rounded w-1/4 mt-6"></div>
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-4 bg-slate-100 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 mb-8">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-rose-600 mr-3 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-rose-900 mb-2">Gagal Membuat Ringkasan</h3>
            <p className="text-rose-700 text-sm mb-4">{error}</p>
            <button
              onClick={onRefresh}
              className="text-sm text-rose-700 hover:text-rose-800 font-medium flex items-center"
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
    <div className="card mb-8">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Ringkasan Eksekutif AI</h2>
          <span className="ai-badge">AI Generated</span>
        </div>
        <button
          onClick={onRefresh}
          className="ai-icon-btn"
          title="Refresh summary"
        >
          <RefreshCw className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="h-2 rounded-md bg-gradient-to-r from-indigo-500/10 to-blue-500/10 mb-5"></div>

      <div className="prose prose-slate max-w-none ai-summary-body markdown-body">
        <ReactMarkdown
          components={{
            h3: ({ children }) => (
              <h3 className="text-base font-semibold tracking-tight text-slate-900 mt-6 mb-2 first:mt-0 flex items-center">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-slate-700 leading-relaxed mb-4">
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-indigo-800">
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
