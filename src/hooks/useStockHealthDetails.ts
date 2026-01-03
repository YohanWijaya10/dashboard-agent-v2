import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { StockHealthDetailsResponse } from '../types';

interface StockHealthDetailsState {
  data: StockHealthDetailsResponse | null;
  loading: boolean;
  error: string | null;
}

export const useStockHealthDetails = (warehouseId?: string, autoFetch: boolean = false) => {
  const [state, setState] = useState<StockHealthDetailsState>({
    data: null,
    loading: false,
    error: null
  });

  const fetchStockHealthDetails = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await api.getStockHealthDetails(warehouseId);
      setState({
        data,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error fetching stock health details:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Gagal mengambil detail kesehatan stok'
      }));
    }
  }, [warehouseId]);

  useEffect(() => {
    if (autoFetch) {
      fetchStockHealthDetails();
    }
  }, [fetchStockHealthDetails, autoFetch]);

  return {
    ...state,
    refresh: fetchStockHealthDetails
  };
};
