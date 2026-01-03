import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AnomalyItem } from '../../types';

interface AnomalyTimelineChartProps {
  anomalies: AnomalyItem[];
  loading: boolean;
}

const AnomalyTimelineChart: React.FC<AnomalyTimelineChartProps> = ({ anomalies, loading }) => {
  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    );
  }

  // Group anomalies by severity and date
  const groupedData = anomalies.reduce((acc, anomaly) => {
    const date = new Date(anomaly.detectedAt).toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric'
    });

    if (!acc[date]) {
      acc[date] = { date, critical: 0, high: 0, medium: 0, low: 0 };
    }

    acc[date][anomaly.severity]++;
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(groupedData);

  const COLORS = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#ca8a04',
    low: '#2563eb'
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Anomaly Timeline (Last 7 Days)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="critical" stackId="a" fill={COLORS.critical} name="Critical" />
          <Bar dataKey="high" stackId="a" fill={COLORS.high} name="High" />
          <Bar dataKey="medium" stackId="a" fill={COLORS.medium} name="Medium" />
          <Bar dataKey="low" stackId="a" fill={COLORS.low} name="Low" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnomalyTimelineChart;
