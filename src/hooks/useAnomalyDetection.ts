import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { AnomalyDetectionResponse } from '../types';

interface AnomalyDetectionState {
  data: AnomalyDetectionResponse | null;
  loading: boolean;
  error: string | null;
}

export const useAnomalyDetection = (autoRefreshInterval: number = 300000) => {
  const [state, setState] = useState<AnomalyDetectionState>({
    data: null,
    loading: true,
    error: null
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await api.getAnomalyDetection();
      setState({
        data,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error fetching anomaly detection data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch anomaly data'
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
