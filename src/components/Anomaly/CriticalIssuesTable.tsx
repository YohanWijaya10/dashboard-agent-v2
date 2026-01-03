import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { AnomalyItem, SeverityLevel } from '../../types';

interface CriticalIssuesTableProps {
  anomalies: AnomalyItem[];
  loading: boolean;
}

const CriticalIssuesTable: React.FC<CriticalIssuesTableProps> = ({
  anomalies,
  loading
}) => {
  const [filter, setFilter] = useState<'all' | 'unusual' | 'stockout'>('all');

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
      case 'low':
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredAnomalies = anomalies
    .filter(a => {
      if (filter === 'unusual') return a.type === 'unusual_transaction';
      if (filter === 'stockout') return a.type === 'stockout';
      return true;
    })
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, 10);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Critical Issues (Top 10)
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unusual')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'unusual' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Unusual
          </button>
          <button
            onClick={() => setFilter('stockout')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'stockout' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Stockout
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filteredAnomalies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No critical issues detected
          </div>
        ) : (
          filteredAnomalies.map((anomaly) => (
            <div
              key={anomaly.anomalyId}
              className={`border rounded-lg p-3 ${getSeverityColor(anomaly.severity)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {getSeverityIcon(anomaly.severity)}
                    <span className="font-semibold text-sm">
                      {anomaly.productName}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-white rounded border">
                      {anomaly.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">
                    {anomaly.warehouseName || 'All Warehouses'}
                  </p>
                  <p className="text-sm">{anomaly.description}</p>
                </div>
                {anomaly.changePercentage !== 0 && (
                  <div className="ml-2">
                    {anomaly.changePercentage > 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                )}
              </div>
              {anomaly.type === 'unusual_transaction' && (
                <div className="grid grid-cols-2 gap-2 text-xs mt-2 pt-2 border-t">
                  <div>
                    <span className="text-gray-600">Baseline: </span>
                    <span className="font-semibold">
                      {anomaly.baselineValue.toFixed(1)} units/day
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Current: </span>
                    <span className="font-semibold">
                      {anomaly.currentValue.toFixed(1)} units/day
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CriticalIssuesTable;
