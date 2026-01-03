import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { AlertSummary } from '../../types';

interface AlertSummaryCardProps {
  summary: AlertSummary | null;
  loading: boolean;
}

const AlertSummaryCard: React.FC<AlertSummaryCardProps> = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const cards = [
    {
      label: 'Critical',
      value: summary.critical,
      icon: AlertCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      iconColor: 'text-red-600'
    },
    {
      label: 'High',
      value: summary.high,
      icon: AlertTriangle,
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-900',
      iconColor: 'text-orange-600'
    },
    {
      label: 'Medium',
      value: summary.medium,
      icon: Info,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-900',
      iconColor: 'text-yellow-600'
    },
    {
      label: 'Low',
      value: summary.low,
      icon: CheckCircle,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      iconColor: 'text-blue-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`card ${card.bgColor} border ${card.borderColor}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${card.textColor}`}>
                {card.label} Priority
              </span>
              <Icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
            <p className={`text-3xl font-bold ${card.textColor}`}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default AlertSummaryCard;
