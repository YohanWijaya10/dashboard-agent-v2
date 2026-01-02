import React from 'react';
import { Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';

interface SummaryPanelProps {
  summary: string | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ summary, loading, error, onRefresh }) => {
  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8 animate-pulse">
        <div className="h-6 bg-blue-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-blue-100 rounded w-full mb-2"></div>
        <div className="h-4 bg-blue-100 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-blue-100 rounded w-4/5"></div>
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
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-600 rounded-lg p-6 mb-8 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <Sparkles className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Ringkasan Eksekutif AI</h2>
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 hover:bg-indigo-100 rounded transition-colors"
          title="Refresh summary"
        >
          <RefreshCw className="w-4 h-4 text-gray-500 hover:text-indigo-600" />
        </button>
      </div>

      <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
        {summary}
      </div>
    </div>
  );
};

export default SummaryPanel;
