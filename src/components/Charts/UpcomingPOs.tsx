import React from 'react';
import { UpcomingPOData } from '../../types';
import { Calendar, Package, TrendingUp } from 'lucide-react';

interface UpcomingPOsProps {
  data: UpcomingPOData[];
  loading?: boolean;
}

const UpcomingPOs: React.FC<UpcomingPOsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="card h-80 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Upcoming Purchase Orders</h3>
        <p className="text-gray-400 text-center py-8">No upcoming purchase orders</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatValue = (value: number) => {
    return `Rp ${value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Upcoming Purchase Orders</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data.map((po) => {
          const daysUntil = getDaysUntil(po.expectedDate);
          const isUrgent = daysUntil <= 7;

          return (
            <div
              key={po.poId}
              className={`p-4 rounded-lg border-l-4 ${
                isUrgent ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{po.supplierName}</p>
                  <p className="text-sm text-gray-600">PO: {po.poId}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  isUrgent ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'
                }`}>
                  {daysUntil > 0 ? `${daysUntil} days` : daysUntil === 0 ? 'Today' : 'Overdue'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(po.expectedDate)}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Package className="w-4 h-4" />
                  <span>{po.itemCount} items</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>{formatValue(po.totalValue)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingPOs;
