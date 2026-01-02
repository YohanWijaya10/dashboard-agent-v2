import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
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

  const option = useMemo(() => {
    return {
      color: [COLORS['Critical'], COLORS['Warning'], COLORS['OK']],
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const count = Number(params.value) || 0;
          const percent = params.percent ?? 0;
          return `${params.name}<br/>${count} (${percent.toFixed(1)}%)`;
        }
      },
      legend: {
        bottom: 0,
        data: data.map(d => d.status)
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '80%'],
          center: ['50%', '45%'],
          minAngle: 5,
          avoidLabelOverlap: true,
          label: {
            show: true,
            formatter: (p: any) => (p.percent >= 8 ? `${p.percent.toFixed(0)}%` : ''),
          },
          labelLine: {
            show: true,
            length: 8,
            length2: 6
          },
          emphasis: {
            scale: true,
            focus: 'self'
          },
          data: data.map(d => ({ name: d.status, value: d.count }))
        }
      ]
    } as any;
  }, [data]);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Stock Health Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-56 md:h-64">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
        </div>
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
