import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { ProductPerformanceData } from '../../types';

interface Props {
  data: ProductPerformanceData[];
  medianTurnover: number;
  medianRevenue: number;
  loading?: boolean;
}

const CATEGORY_COLORS = {
  Star: '#10b981',
  'Cash Cow': '#3b82f6',
  'Question Mark': '#f59e0b',
  Dog: '#ef4444'
};

const ProductPerformanceChart: React.FC<Props> = ({
  data,
  medianTurnover,
  medianRevenue,
  loading
}) => {
  if (loading) {
    return (
      <div className="card h-96 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card h-96 flex items-center justify-center">
        <p className="text-gray-400">No performance data available</p>
      </div>
    );
  }

  const option = useMemo(() => {
    const seriesData = {
      Star: [] as any[],
      'Cash Cow': [] as any[],
      'Question Mark': [] as any[],
      Dog: [] as any[]
    };

    data.forEach(product => {
      seriesData[product.performanceCategory].push({
        name: product.productName,
        value: [
          product.turnoverRate,
          product.revenuePotential,
          product.totalIssued30Days
        ],
        itemStyle: {
          color: CATEGORY_COLORS[product.performanceCategory]
        },
        sku: product.sku,
        category: product.category
      });
    });

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const data = params.data;
          return `<strong>${data.name}</strong><br/>
            SKU: ${data.sku}<br/>
            Category: ${data.category}<br/>
            Turnover Rate: ${data.value[0].toFixed(2)}<br/>
            Revenue Potential: Rp ${data.value[1].toLocaleString('id-ID')}<br/>
            Total Issued: ${data.value[2].toLocaleString('id-ID')} units`;
        }
      },
      legend: {
        data: ['Star', 'Cash Cow', 'Question Mark', 'Dog'],
        bottom: 0,
        textStyle: { fontSize: 12 }
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '10%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        name: 'Turnover Rate',
        nameLocation: 'middle',
        nameGap: 30,
        type: 'value',
        splitLine: { show: true, lineStyle: { type: 'dashed' } },
        axisLine: { show: true }
      },
      yAxis: {
        name: 'Revenue Potential (Rp)',
        nameLocation: 'middle',
        nameGap: 50,
        type: 'value',
        splitLine: { show: true, lineStyle: { type: 'dashed' } },
        axisLine: { show: true },
        axisLabel: {
          formatter: (val: number) => {
            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
            if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
            return val.toFixed(0);
          }
        }
      },
      series: [
        {
          name: 'Star',
          type: 'scatter',
          symbolSize: (data: number[]) => Math.sqrt(data[2]) * 2,
          data: seriesData.Star,
          markLine: {
            silent: true,
            lineStyle: { color: '#666', type: 'solid', width: 2 },
            data: [
              { xAxis: medianTurnover },
              { yAxis: medianRevenue }
            ]
          }
        },
        {
          name: 'Cash Cow',
          type: 'scatter',
          symbolSize: (data: number[]) => Math.sqrt(data[2]) * 2,
          data: seriesData['Cash Cow']
        },
        {
          name: 'Question Mark',
          type: 'scatter',
          symbolSize: (data: number[]) => Math.sqrt(data[2]) * 2,
          data: seriesData['Question Mark']
        },
        {
          name: 'Dog',
          type: 'scatter',
          symbolSize: (data: number[]) => Math.sqrt(data[2]) * 2,
          data: seriesData.Dog
        }
      ]
    } as any;
  }, [data, medianTurnover, medianRevenue]);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">BCG Matrix - Product Performance</h3>
      <div className="h-96">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
};

export default ProductPerformanceChart;
