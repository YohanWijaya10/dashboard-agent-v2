import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import api from '../services/api';
import { Warehouse, SafetyStockAutoAdjustResponse, SafetyStockPolicy } from '../types';

export function useSafetyStockAuto() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SafetyStockAutoAdjustResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    const base = 'https://serverless-twg8.vercel.app';
    const load = async () => {
      try {
        // Go directly to serverless to avoid backend 404 noise
        const res = await axios.get<Warehouse[]>(`${base}/api/warehouses`, { timeout: 20000 });
        if (!mounted) return;
        const active = res.data.filter(w => w.isActive);
        setWarehouses(active);
        if (active.length && !selectedWarehouse) {
          setSelectedWarehouse(active[0].warehouseId);
        }
      } catch (e: any) {
        if (!mounted) return;
        // Likely CORS; fall back to manual input (keep error for UI hint)
        setError(e?.response?.data?.message || e?.message || 'Failed to load warehouses (CORS). Isi ID gudang manual.');
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const runAutoAdjust = useCallback(async (policy?: Partial<SafetyStockPolicy>) => {
    if (!selectedWarehouse) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.autoAdjustSafetyStock(selectedWarehouse, policy);
      setResult(res);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to auto-adjust');
    } finally {
      setLoading(false);
    }
  }, [selectedWarehouse]);

  return {
    warehouses,
    selectedWarehouse,
    setSelectedWarehouse,
    loading,
    error,
    result,
    runAutoAdjust
  };
}

export default useSafetyStockAuto;
