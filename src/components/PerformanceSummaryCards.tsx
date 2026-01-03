import React from 'react';
import { TrendingUp, DollarSign, HelpCircle, TrendingDown } from 'lucide-react';
import type { PerformanceSummary } from '../types';

interface Props {
  summary: PerformanceSummary;
  loading?: boolean;
}

const PerformanceSummaryCards: React.FC<Props> = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card h-32 animate-pulse bg-slate-100" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Stars',
      value: summary.stars,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-slate-50 border border-slate-200',
      description: 'High Turnover + High Revenue'
    },
    {
      title: 'Cash Cows',
      value: summary.cashCows,
      icon: DollarSign,
      color: 'text-indigo-600',
      bgColor: 'bg-slate-50 border border-slate-200',
      description: 'Low Turnover + High Revenue'
    },
    {
      title: 'Question Marks',
      value: summary.questionMarks,
      icon: HelpCircle,
      color: 'text-amber-600',
      bgColor: 'bg-slate-50 border border-slate-200',
      description: 'High Turnover + Low Revenue'
    },
    {
      title: 'Dogs',
      value: summary.dogs,
      icon: TrendingDown,
      color: 'text-rose-600',
      bgColor: 'bg-slate-50 border border-slate-200',
      description: 'Low Turnover + Low Revenue'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="card">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <span className={`text-3xl font-semibold tracking-tight text-slate-900`}>
                {card.value}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              {card.title}
            </h3>
            <p className="text-xs text-slate-500">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export default PerformanceSummaryCards;
