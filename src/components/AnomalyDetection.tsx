import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useAnomalyDetection } from '../hooks/useAnomalyDetection';
import { useAnomalyInsights } from '../hooks/useAnomalyInsights';
import AlertSummaryCard from './Anomaly/AlertSummaryCard';
import AnomalyTimelineChart from './Anomaly/AnomalyTimelineChart';
import CriticalIssuesTable from './Anomaly/CriticalIssuesTable';
import AnomalyInsightsPanel from './Anomaly/AnomalyInsightsPanel';

const AnomalyDetection: React.FC = () => {
  const { data, loading, error, refresh } = useAnomalyDetection();
  const insights = useAnomalyInsights();

  React.useEffect(() => {
    if (data && !insights.data && !insights.loading) {
      insights.fetchInsights();
    }
  }, [data]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Anomaly Data</h2>
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
        <div>
          <h2 className="text-2xl font-bold ai-title">Anomaly Detection</h2>
          <p className="text-gray-500 mt-1">
            Real-time anomaly detection with 7-day baseline comparison
          </p>
        </div>
        <button
          onClick={refresh}
          className="ai-icon-btn"
          aria-label="Refresh anomaly data"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Alert Summary Cards */}
      <AlertSummaryCard summary={data?.summary || null} loading={loading} />

      {/* Timeline Chart */}
      <AnomalyTimelineChart
        anomalies={data?.anomalies || []}
        loading={loading}
      />

      {/* Two-column layout: Critical Issues + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CriticalIssuesTable
          anomalies={data?.anomalies || []}
          loading={loading}
        />
        <AnomalyInsightsPanel
          insights={insights.data}
          loading={insights.loading}
          error={insights.error}
          onRefresh={insights.fetchInsights}
        />
      </div>
    </div>
  );
};

export default AnomalyDetection;
