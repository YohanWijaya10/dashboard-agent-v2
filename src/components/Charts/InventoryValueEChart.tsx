import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { InventoryValueByCategory } from '../../types';

interface Props {
  data: InventoryValueByCategory[];
  loading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const InventoryValueEChart: React.FC<Props> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="card h-64 md:h-80 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card h-64 md:h-80 flex items-center justify-center">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  const option = useMemo(() => {
    return {
      color: COLORS,
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const val = Number(params.value) || 0;
          const percent = params.percent ?? 0;
          const valueStr = `Rp ${val.toLocaleString('id-ID')}`;
          return `${params.name}<br/>${valueStr} (${percent.toFixed(1)}%)`;
        }
      },
      legend: {
        bottom: 0,
        type: 'scroll'
      },
      series: [
        {
          name: 'Inventory Value',
          type: 'pie',
          radius: ['50%', '80%'],
          center: ['50%', '45%'],
          minAngle: 5,
          avoidLabelOverlap: true,
          label: {
            show: true,
            formatter: (p: any) => (p.percent >= 5 ? `${p.percent.toFixed(1)}%` : ''),
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
          data: data.map((d) => ({ name: d.category, value: d.value }))
        }
      ]
    } as any;
  }, [data]);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Inventory Value by Category</h3>
      <div className="h-64 md:h-80">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
};

export default InventoryValueEChart;

