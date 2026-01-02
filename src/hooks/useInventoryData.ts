import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  DashboardMetrics,
  InventoryValueByCategory,
  StockMovementData,
  TopProductData,
  WarehouseDistributionData,
  StockHealthData,
  UpcomingPOData
} from '../types';

interface InventoryDataState {
  metrics: DashboardMetrics | null;
  inventoryValue: InventoryValueByCategory[];
  stockMovement: StockMovementData[];
  topProducts: TopProductData[];
  warehouseDistribution: WarehouseDistributionData[];
  stockHealth: StockHealthData[];
  upcomingPOs: UpcomingPOData[];
  loading: boolean;
  error: string | null;
}

export const useInventoryData = (autoRefreshInterval: number = 300000) => {
  const [state, setState] = useState<InventoryDataState>({
    metrics: null,
    inventoryValue: [],
    stockMovement: [],
    topProducts: [],
    warehouseDistribution: [],
    stockHealth: [],
    upcomingPOs: [],
    loading: true,
    error: null
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [
        metrics,
        inventoryValue,
        stockMovement,
        topProducts,
        warehouseDistribution,
        stockHealth,
        upcomingPOs
      ] = await Promise.all([
        api.getDashboardMetrics(),
        api.getInventoryValueByCategory(),
        api.getStockMovement(30),
        api.getTopProducts(10),
        api.getWarehouseDistribution(),
        api.getStockHealth(),
        api.getUpcomingPOs()
      ]);

      setState({
        metrics,
        inventoryValue,
        stockMovement,
        topProducts,
        warehouseDistribution,
        stockHealth,
        upcomingPOs,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error fetching inventory data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch data'
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Set up auto-refresh
    const interval = setInterval(fetchData, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, autoRefreshInterval]);

  return {
    ...state,
    refresh: fetchData
  };
};
