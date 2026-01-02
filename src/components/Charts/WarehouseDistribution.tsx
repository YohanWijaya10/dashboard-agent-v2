import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WarehouseDistributionData } from '../../types';

interface WarehouseDistributionChartProps {
  data: WarehouseDistributionData[];
  loading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

const WarehouseDistributionChart: React.FC<WarehouseDistributionChartProps> = ({ data, loading }) => {
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

  // Determine dynamic category keys from data (exclude 'warehouseName')
  const categoryKeys = useMemo(() => {
    const keys = new Set<string>();
    data.forEach((row) => {
      Object.keys(row).forEach((k) => {
        if (k !== 'warehouseName') keys.add(k);
      });
    });
    return Array.from(keys);
  }, [data]);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Warehouse Stock Distribution by Category</h3>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="warehouseName" />
            <YAxis tickFormatter={(value) => Number(value).toLocaleString('id-ID')} />
            <Tooltip
              formatter={(value: number) => Number(value).toLocaleString('id-ID', { maximumFractionDigits: 2 })}
              labelFormatter={(label) => `Warehouse: ${label}`}
            />
            <Legend />
            {categoryKeys.map((key, idx) => (
              <Bar key={key} dataKey={key} stackId="a" fill={COLORS[idx % COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WarehouseDistributionChart;
