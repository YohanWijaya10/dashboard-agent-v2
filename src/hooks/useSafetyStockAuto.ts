import { useEffect, useMemo, useState, useCallback } from 'react';
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
    api.getWarehouses()
      .then((ws) => {
        if (!mounted) return;
        const active = ws.filter(w => w.isActive);
        setWarehouses(active);
        if (active.length && !selectedWarehouse) {
          setSelectedWarehouse(active[0].warehouseId);
        }
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || 'Failed to load warehouses');
      });
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

