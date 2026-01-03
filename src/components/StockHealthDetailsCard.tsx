import React from 'react';
import { AlertCircle, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { StockHealthDetailsResponse } from '../types';

interface StockHealthDetailsCardProps {
  data: StockHealthDetailsResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const StockHealthDetailsCard: React.FC<StockHealthDetailsCardProps> = ({
  data,
  loading,
  error,
  onRefresh
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-3">
          <div className="h-24 bg-gray-100 rounded"></div>
          <div className="h-24 bg-gray-100 rounded"></div>
          <div className="h-24 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="card">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-2">Gagal Memuat Detail</h3>
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

  // No data state
  if (!data) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-400">
          Klik tombol untuk memuat detail kesehatan stok
        </div>
      </div>
    );
  }

  const hasCritical = data.critical.length > 0;
  const hasWarning = data.warning.length > 0;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center">
          <Sparkles className="w-6 h-6 text-indigo-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Detail Kesehatan Stok AI</h2>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh details"
        >
          <RefreshCw className="w-5 h-5 text-gray-600 hover:text-indigo-600" />
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-sm font-medium text-red-900">Critical</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{data.totalCritical}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-900">Warning</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{data.totalWarning}</p>
        </div>
      </div>

      {/* Critical items */}
      {hasCritical && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Produk Critical
          </h3>
          <div className="space-y-3">
            {data.critical.map((item, idx) => (
              <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                    <p className="text-sm text-gray-600">{item.warehouseName}</p>
                  </div>
                  <span className="px-2 py-1 bg-red-200 text-red-800 text-xs font-semibold rounded">
                    CRITICAL
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                  <div>
                    <span className="text-gray-600">Qty: </span>
                    <span className="font-semibold">{item.qtyOnHand}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Safety: </span>
                    <span className="font-semibold">{item.safetyStock}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Reorder: </span>
                    <span className="font-semibold">{item.reorderPoint}</span>
                  </div>
                </div>
                {item.insight && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="text-gray-700 leading-relaxed text-sm mb-0">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-red-900">
                              {children}
                            </strong>
                          ),
                        }}
                      >
                        {item.insight}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning items */}
      {hasWarning && (
        <div>
          <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Produk Warning
          </h3>
          <div className="space-y-3">
            {data.warning.map((item, idx) => (
              <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                    <p className="text-sm text-gray-600">{item.warehouseName}</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-semibold rounded">
                    WARNING
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                  <div>
                    <span className="text-gray-600">Qty: </span>
                    <span className="font-semibold">{item.qtyOnHand}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Safety: </span>
                    <span className="font-semibold">{item.safetyStock}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Reorder: </span>
                    <span className="font-semibold">{item.reorderPoint}</span>
                  </div>
                </div>
                {item.insight && (
                  <div className="mt-3 pt-3 border-t border-yellow-200">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="text-gray-700 leading-relaxed text-sm mb-0">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-yellow-900">
                              {children}
                            </strong>
                          ),
                        }}
                      >
                        {item.insight}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No issues found */}
      {!hasCritical && !hasWarning && (
        <div className="text-center py-8 text-gray-500">
          Tidak ada produk dengan status critical atau warning
        </div>
      )}
    </div>
  );
};

export default StockHealthDetailsCard;
