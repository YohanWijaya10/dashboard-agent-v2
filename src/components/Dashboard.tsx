import React, { useState } from 'react';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Users,
  Warehouse,
  RefreshCw
} from 'lucide-react';
import MetricCard from './MetricCard';
import InventoryValueChart from './Charts/InventoryValueEChart';
import StockMovementChart from './Charts/StockMovement';
import TopProductsChart from './Charts/TopProducts';
// Removed from main view per UX feedback
import { useInventoryData } from '../hooks/useInventoryData';
import SummaryPanel from './SummaryPanel';
import { useSummary } from '../hooks/useSummary';
import StockHealthDetailsCard from './StockHealthDetailsCard';
import { useStockHealthDetails } from '../hooks/useStockHealthDetails';
import ProductPerformanceAnalysis from './ProductPerformanceAnalysis';

type TabType = 'dashboard' | 'performance';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const summary = useSummary(true);
  const stockHealthDetails = useStockHealthDetails(undefined, true);
  const {
    metrics,
    inventoryValue,
    stockMovement,
    topProducts,
    loading,
    error,
    refresh
  } = useInventoryData();

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `Rp ${(value / 1000).toFixed(1)}K`;
    }
    return `Rp ${value.toFixed(0)}`;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={refresh} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Inventory Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString('id-ID')}
              </span>
              {activeTab === 'dashboard' && (
                <button
                  onClick={refresh}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Refresh data"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-white text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'performance'
                  ? 'bg-white text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Performance Analysis</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab Content (kept mounted) */}
        <div className={activeTab === 'dashboard' ? '' : 'hidden'}>
            {/* Executive Summary Hero Section */}
            <SummaryPanel
              summary={summary.summary}
              loading={summary.loading}
              error={summary.error}
              onRefresh={summary.refresh}
            />

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              <MetricCard
                title="Total Inventory Value"
                value={metrics ? formatCurrency(metrics.totalInventoryValue) : '-'}
                icon={TrendingUp}
                loading={loading}
              />
              <MetricCard
                title="Active Products"
                value={metrics?.totalActiveProducts || 0}
                icon={Package}
                loading={loading}
              />
              <MetricCard
                title="Below Safety Stock"
                value={metrics?.productsBelowSafetyStock || 0}
                icon={AlertTriangle}
                alert={metrics ? metrics.productsBelowSafetyStock > 0 : false}
                loading={loading}
              />
              <MetricCard
                title="Pending PO Value"
                value={metrics ? formatCurrency(metrics.pendingPOValue) : '-'}
                icon={ShoppingCart}
                loading={loading}
              />
              <MetricCard
                title="Active Suppliers"
                value={metrics?.totalActiveSuppliers || 0}
                icon={Users}
                loading={loading}
              />
              <MetricCard
                title="Total Warehouses"
                value={metrics?.totalWarehouses || 0}
                icon={Warehouse}
                loading={loading}
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <InventoryValueChart data={inventoryValue} loading={loading} />
              <StockMovementChart data={stockMovement} loading={loading} />
            </div>

        {/* Charts Row 2 (Stock Health Status removed) */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <TopProductsChart data={topProducts} loading={loading} />
        </div>

        {/* Warehouse Distribution removed from main view */}

        {/* Upcoming POs removed; will replace with PO Status Summary (hidden for now) */}

            {/* Stock Health Details */}
            <div>
              <StockHealthDetailsCard
                data={stockHealthDetails.data}
                loading={stockHealthDetails.loading}
                error={stockHealthDetails.error}
                onRefresh={stockHealthDetails.refresh}
              />
            </div>
        </div>

        {/* Performance Tab Content (kept mounted) */}
        <div className={activeTab === 'performance' ? '' : 'hidden'}>
          <ProductPerformanceAnalysis />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
