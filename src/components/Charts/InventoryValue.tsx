import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { InventoryValueByCategory } from '../../types';

interface InventoryValueChartProps {
  data: InventoryValueByCategory[];
  loading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const InventoryValueChart: React.FC<InventoryValueChartProps> = ({ data, loading }) => {
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
      <h3 className="text-lg font-semibold mb-4">Inventory Value by Category</h3>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              minAngle={5}
              labelLine={false}
              label={(entry: any) => (entry.percentage >= 5 ? `${entry.percentage.toFixed(1)}%` : '')}
              dataKey="value"
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatValue(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Custom legend with values for readability */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {data.map((item, index) => (
          <div key={item.category} className="flex items-center space-x-2 text-sm">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="truncate">
              {item.category}: {item.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryValueChart;
