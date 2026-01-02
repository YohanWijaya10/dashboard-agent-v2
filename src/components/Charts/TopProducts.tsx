import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TopProductData } from '../../types';

interface TopProductsChartProps {
  data: TopProductData[];
  loading?: boolean;
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ data, loading }) => {
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

  const formatValue = (value: number) => {
    return `Rp ${(value / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Top 10 Products by Value</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="productName"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12 }}
          />
          <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
          <Tooltip
            formatter={(value: number) => formatValue(value)}
            labelStyle={{ color: '#000' }}
          />
          <Legend />
          <Bar dataKey="value" fill="#3b82f6" name="Value (IDR)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductsChart;
