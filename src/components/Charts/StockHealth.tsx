import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { StockHealthData } from '../../types';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface StockHealthChartProps {
  data: StockHealthData[];
  loading?: boolean;
}

const COLORS: Record<string, string> = {
  'Critical': '#ef4444',
  'Warning': '#f59e0b',
  'OK': '#10b981'
};

const ICONS: Record<string, React.ReactNode> = {
  'Critical': <AlertCircle className="w-5 h-5" />,
  'Warning': <AlertTriangle className="w-5 h-5" />,
  'OK': <CheckCircle className="w-5 h-5" />
};

const StockHealthChart: React.FC<StockHealthChartProps> = ({ data, loading }) => {
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
      <h3 className="text-lg font-semibold mb-4">Stock Health Status</h3>
      <div className="grid grid-cols-2 gap-4">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col justify-center space-y-3">
          {data.map((item) => (
            <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div style={{ color: COLORS[item.status] }}>
                  {ICONS[item.status]}
                </div>
                <span className="font-medium">{item.status}</span>
              </div>
              <div className="text-right">
                <p className="font-bold">{item.count}</p>
                <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockHealthChart;
