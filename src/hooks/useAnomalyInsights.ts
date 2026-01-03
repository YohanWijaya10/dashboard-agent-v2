import { useState, useCallback } from 'react';
import api from '../services/api';
import { AnomalyInsightResponse } from '../types';

interface AnomalyInsightsState {
  data: AnomalyInsightResponse | null;
  loading: boolean;
  error: string | null;
}

export const useAnomalyInsights = () => {
  const [state, setState] = useState<AnomalyInsightsState>({
    data: null,
    loading: false,
    error: null
  });

  const fetchInsights = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await api.getAnomalyInsights();
      setState({
        data,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error fetching anomaly insights:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Gagal mengambil AI insights'
      }));
    }
  }, []);

  return {
    ...state,
    fetchInsights
  };
};
