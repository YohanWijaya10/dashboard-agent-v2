import React from 'react';
import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AnomalyInsightResponse } from '../../types';

interface AnomalyInsightsPanelProps {
  insights: AnomalyInsightResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const AnomalyInsightsPanel: React.FC<AnomalyInsightsPanelProps> = ({
  insights,
  loading,
  error,
  onRefresh
}) => {
  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
          <div className="h-4 bg-gray-100 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-2">Failed to Load AI Insights</h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <button
              onClick={onRefresh}
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-400">
          Loading AI insights...
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Sparkles className="w-5 h-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            AI Insights & Recommendations
          </h3>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh insights"
        >
          <RefreshCw className="w-4 h-4 text-gray-600 hover:text-indigo-600" />
        </button>
      </div>

      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            h3: ({ children }) => (
              <h3 className="text-base font-bold text-gray-900 mt-4 mb-2 first:mt-0">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 leading-relaxed mb-3">
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-gray-900">
                {children}
              </strong>
            ),
          }}
        >
          {insights.insights}
        </ReactMarkdown>
      </div>

      {insights.topCriticalItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Top Critical Items:
          </p>
          <div className="flex flex-wrap gap-2">
            {insights.topCriticalItems.map((item, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Generated: {new Date(insights.generatedAt).toLocaleString('id-ID')}
      </div>
    </div>
  );
};

export default AnomalyInsightsPanel;
