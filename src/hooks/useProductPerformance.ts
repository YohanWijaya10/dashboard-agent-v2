import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  ProductPerformanceResponse,
  ProductPerformanceInsightResponse
} from '../types';

interface ProductPerformanceState {
  performance: ProductPerformanceResponse | null;
  insights: ProductPerformanceInsightResponse | null;
  loading: boolean;
  error: string | null;
}

export const useProductPerformance = (
  warehouseId?: string,
  category?: string,
  autoFetch: boolean = true
) => {
  const [state, setState] = useState<ProductPerformanceState>({
    performance: null,
    insights: null,
    loading: false,
    error: null
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch performance data and insights in parallel
      const [performance, insights] = await Promise.all([
        api.getProductPerformance(warehouseId, category),
        api.getProductPerformanceInsights(warehouseId, category)
      ]);

      setState({
        performance,
        insights,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error fetching product performance:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch performance data'
      }));
    }
  }, [warehouseId, category]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return {
    ...state,
    refresh: fetchData
  };
};
