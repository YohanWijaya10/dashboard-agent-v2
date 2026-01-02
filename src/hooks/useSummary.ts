import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface SummaryState {
  summary: string | null;
  loading: boolean;
  error: string | null;
  generatedAt: string | null;
}

export const useSummary = (autoFetch: boolean = true) => {
  const [state, setState] = useState<SummaryState>({
    summary: null,
    loading: true,
    error: null,
    generatedAt: null
  });

  const fetchSummary = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await api.getExecutiveSummary();
      setState({
        summary: data.summary,
        loading: false,
        error: null,
        generatedAt: data.generatedAt
      });
    } catch (error: any) {
      console.error('Error fetching summary:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Gagal menghasilkan ringkasan'
      }));
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchSummary();
    }
  }, [fetchSummary, autoFetch]);

  return {
    ...state,
    refresh: fetchSummary
  };
};
