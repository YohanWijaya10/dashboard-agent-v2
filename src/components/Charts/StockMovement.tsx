import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StockMovementData } from '../../types';

interface StockMovementChartProps {
  data: StockMovementData[];
  loading?: boolean;
}

const StockMovementChart: React.FC<StockMovementChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="card h-80 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card h-80 flex items-center justify-center">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Stock Movement Trend (30 Days)</h3>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('id-ID');
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="receipt" stroke="#10b981" name="Receipt" strokeWidth={2} />
            <Line type="monotone" dataKey="issue" stroke="#ef4444" name="Issue" strokeWidth={2} />
            <Line type="monotone" dataKey="net" stroke="#3b82f6" name="Net" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockMovementChart;
