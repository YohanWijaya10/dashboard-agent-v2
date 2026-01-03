import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  alert?: boolean;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  alert,
  loading
}) => {
  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-slate-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className={`card-hover ${alert ? 'border-rose-300 bg-rose-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-600 mb-1">{title}</p>
          <p className={`text-3xl font-semibold tracking-tight ${alert ? 'text-rose-600' : 'text-slate-900'}`}>
            {value}
          </p>
          {trend && (
            <p className={`text-xs mt-2 ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-slate-50 border ${alert ? 'border-rose-200' : 'border-slate-200'}`}>
          <Icon className={`w-6 h-6 ${alert ? 'text-rose-600' : 'text-indigo-600'}`} />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
