import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useProductPerformance } from '../hooks/useProductPerformance';
import PerformanceSummaryCards from './PerformanceSummaryCards';
import ProductPerformanceChart from './Charts/ProductPerformanceChart';
import PerformanceInsightsPanel from './PerformanceInsightsPanel';

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

      {/* BCG Matrix Chart */}
      <ProductPerformanceChart
        data={performance?.products || []}
        medianTurnover={performance?.summary.medianTurnover || 0}
        medianRevenue={performance?.summary.medianRevenue || 0}
        loading={loading}
      />

      {/* TODO: Add PerformanceTables component here */}
      {/* TODO: Add PerformanceDataTable component here */}
    </div>
  );
};

export default ProductPerformanceAnalysis;
