import axios, { AxiosInstance } from 'axios';
import {
  DashboardMetrics,
  InventoryValueByCategory,
  StockMovementData,
  TopProductData,
  WarehouseDistributionData,
  StockHealthData,
  UpcomingPOData,
  StockHealthDetailsResponse,
  Warehouse,
  ProductPerformanceResponse,
  ProductPerformanceInsightResponse,
  AnomalyDetectionResponse,
  AnomalyInsightResponse
} from '../types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await this.client.get<DashboardMetrics>('/api/dashboard/metrics');
    return response.data;
  }

  async getInventoryValueByCategory(): Promise<InventoryValueByCategory[]> {
    const response = await this.client.get<InventoryValueByCategory[]>('/api/dashboard/inventory-value');
    return response.data;
  }

  async getStockMovement(days: number = 30): Promise<StockMovementData[]> {
    const response = await this.client.get<StockMovementData[]>('/api/dashboard/stock-movement', {
      params: { days }
    });
    return response.data;
  }

  async getTopProducts(limit: number = 10): Promise<TopProductData[]> {
    const response = await this.client.get<TopProductData[]>('/api/dashboard/top-products', {
      params: { limit }
    });
    return response.data;
  }

  async getWarehouseDistribution(): Promise<WarehouseDistributionData[]> {
    const response = await this.client.get<WarehouseDistributionData[]>('/api/dashboard/warehouse-dist');
    return response.data;
  }

  async getStockHealth(): Promise<StockHealthData[]> {
    const response = await this.client.get<StockHealthData[]>('/api/dashboard/stock-health');
    return response.data;
  }

  async getUpcomingPOs(): Promise<UpcomingPOData[]> {
    const response = await this.client.get<UpcomingPOData[]>('/api/dashboard/upcoming-po');
    return response.data;
  }

  async getExecutiveSummary(): Promise<{ summary: string; generatedAt: string }> {
    const response = await this.client.get<{ summary: string; generatedAt: string }>(
      '/api/dashboard/executive-summary',
      { timeout: 90000 } // 90 seconds for AI generation
    );
    return response.data;
  }

  async getStockHealthDetails(warehouseId?: string): Promise<StockHealthDetailsResponse> {
    const response = await this.client.get<StockHealthDetailsResponse>(
      '/api/dashboard/stock-health-details',
      {
        params: warehouseId ? { warehouseId } : {},
        timeout: 90000 // 90 seconds for AI generation
      }
    );
    return response.data;
  }

  async getWarehouses(): Promise<Warehouse[]> {
    const response = await this.client.get<Warehouse[]>('/api/warehouses');
    return response.data;
  }

  async getProductPerformance(
    warehouseId?: string,
    category?: string
  ): Promise<ProductPerformanceResponse> {
    const response = await this.client.get<ProductPerformanceResponse>(
      '/api/dashboard/product-performance',
      {
        params: {
          ...(warehouseId && { warehouseId }),
          ...(category && { category })
        },
        timeout: 30000
      }
    );
    return response.data;
  }

  async getProductPerformanceInsights(
    warehouseId?: string,
    category?: string
  ): Promise<ProductPerformanceInsightResponse> {
    const response = await this.client.get<ProductPerformanceInsightResponse>(
      '/api/dashboard/product-performance-insights',
      {
        params: {
          ...(warehouseId && { warehouseId }),
          ...(category && { category })
        },
        timeout: 90000 // AI generation timeout
      }
    );
    return response.data;
  }

  async getAnomalyDetection(): Promise<AnomalyDetectionResponse> {
    const response = await this.client.get<AnomalyDetectionResponse>(
      '/api/dashboard/anomaly-detection',
      { timeout: 30000 }
    );
    return response.data;
  }

  async getAnomalyInsights(): Promise<AnomalyInsightResponse> {
    const response = await this.client.get<AnomalyInsightResponse>(
      '/api/dashboard/anomaly-insights',
      { timeout: 90000 } // AI generation timeout
    );
    return response.data;
  }

  async autoAdjustSafetyStock(
    warehouseId: string,
    policy?: Partial<import('../types').SafetyStockPolicy>
  ): Promise<import('../types').SafetyStockAutoAdjustResponse> {
    // Backend production route is not deployed; go directly to serverless fallback.
    return await this.clientSideAutoAdjust(warehouseId, policy);
  }

  private async clientSideAutoAdjust(
    warehouseId: string,
    policy?: Partial<import('../types').SafetyStockPolicy>
  ): Promise<import('../types').SafetyStockAutoAdjustResponse> {
    const {
      serviceLevel = 0.95,
      leadTimeDays = 7,
      // legacy single cap (used if new caps not provided)
      maxChangePercent = 20,
      // new guardrails
      downCapPercent,
      upCapPercent,
      hysteresisDelta = 10,
      cooldownDays = 14,
      onlyIncrease = false,
      minDaysCover = 7,
      roundToPack = null,
      minSafetyStock = 0
    } = policy || {};

    const base = 'https://serverless-twg8.vercel.app';

    // Fetch data with labeled errors for easier debugging
    const getJSON = async <T>(url: string, label: string): Promise<T> => {
      try {
        const res = await axios.get<T>(url, { timeout: 30000 });
        return res.data as T;
      } catch (e: any) {
        const status = e?.response?.status;
        const detail = e?.response?.data ? JSON.stringify(e.response.data) : e?.message;
        throw new Error(`[Fallback] GET ${label} (${url}) failed: ${status || 'ERR'} ${detail || ''}`);
      }
    };

    type ProductLite = { productId: string; name: string; sku?: string };
    const balancesRaw = await getJSON<import('../types').InventoryBalance[]>(`${base}/api/inventorybalance`, 'inventorybalance');
    const trxRaw = await getJSON<import('../types').InventoryTransaction[]>(`${base}/api/inventorytransaction`, 'inventorytransaction');
    // products/warehouses are optional for names; do not block on 404
    let products: ProductLite[] = [];
    let warehouses: import('../types').Warehouse[] = [];
    try { products = await getJSON<ProductLite[]>(`${base}/api/products`, 'products'); } catch {}
    try { warehouses = await getJSON<import('../types').Warehouse[]>(`${base}/api/warehouses`, 'warehouses'); } catch {}

    const balances = balancesRaw
      .map(b => ({
        ...b,
        qtyOnHand: Number(b.qtyOnHand),
        qtyReserved: Number(b.qtyReserved),
        safetyStock: Number(b.safetyStock),
        reorderPoint: Number(b.reorderPoint)
      }))
      .filter(b => b.warehouseId === warehouseId);
    const transactions = trxRaw.map(t => ({ ...t, qty: Number(t.qty) }));

    const productMap = new Map(products.map(p => [p.productId, p]));
    const warehouseMap = new Map(warehouses.map(w => [w.warehouseId, w]));

    // Build last 60 days date keys
    const windowDays = 60;
    const dates: string[] = [];
    const today = new Date();
    for (let i = windowDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }

    // Z value
    const zTable: Record<number, number> = { 0.9: 1.2816, 0.95: 1.6449, 0.975: 1.96, 0.99: 2.3263 } as const;
    const nearest = Object.keys(zTable)
      .map(Number)
      .reduce((prev, curr) => (Math.abs(curr - serviceLevel) < Math.abs(prev - serviceLevel) ? curr : prev), 0.95);
    const z = (zTable as any)[nearest] || 1.6449;

    // Index daily ISSUE per product
    const issueByKey = new Map<string, number>();
    for (const t of transactions) {
      if (t.trxType !== 'ISSUE') continue;
      const d = new Date(t.trxDate).toISOString().slice(0, 10);
      if (!dates.includes(d)) continue;
      const key = `${d}|${t.productId}|${t.warehouseId}`;
      issueByKey.set(key, (issueByKey.get(key) || 0) + Number(t.qty));
    }

    const changes: import('../types').SafetyStockAdjustment[] = [];

    // cooldown key helper
    const coolKey = (w: string, p: string) => `ss_cooldown_${w}_${p}`;

    for (const bal of balances) {
      const daily = dates.map(date => issueByKey.get(`${date}|${bal.productId}|${bal.warehouseId}`) || 0);
      const sorted = [...daily].sort((a, b) => a - b);
      const p95 = sorted[Math.floor(0.95 * (sorted.length - 1))] || 0;
      const clamped = daily.map(v => Math.min(v, p95));
      const mean = clamped.reduce((s, v) => s + v, 0) / (clamped.length || 1);
      const variance = clamped.reduce((s, v) => s + (v - mean) * (v - mean), 0) / Math.max(1, clamped.length - 1);
      const stdDaily = Math.sqrt(variance);
      const last7 = clamped.slice(-7);
      const avg7 = last7.length ? last7.reduce((s, v) => s + v, 0) / last7.length : mean;

      const sigmaLT = stdDaily * Math.sqrt(Math.max(1, leadTimeDays));
      const baseBySigma = Math.round(z * sigmaLT);
      const floorByDays = Math.round(Math.max(minSafetyStock, (minDaysCover || 0) * avg7));
      const floorOp = Math.max(floorByDays, Number(bal.reorderPoint) || 0, minSafetyStock);
      let baseRecommended = Math.max(baseBySigma, floorOp);

      const current = Number(bal.safetyStock) || 0;
      // Hysteresis: skip small changes
      const percDelta = current === 0 ? 100 : (Math.abs(baseRecommended - current) / Math.max(1, current)) * 100;
      if (percDelta < (hysteresisDelta || 0)) {
        baseRecommended = current;
      }

      // Anti-ratcheting: block decrease if current close to base target (<= 1.2x)
      if (baseRecommended < current && current <= baseRecommended * 1.2) {
        baseRecommended = current;
      }

      // Cooldown for decreases
      if (baseRecommended < current) {
        if (onlyIncrease) baseRecommended = current;
        const lastDecTs = typeof window !== 'undefined' ? localStorage.getItem(coolKey(bal.warehouseId, bal.productId)) : null;
        if (lastDecTs) {
          const days = (Date.now() - Number(lastDecTs)) / (1000 * 60 * 60 * 24);
          if (days < (cooldownDays || 0)) {
            baseRecommended = current;
          }
        }
      }

      // Apply asymmetric caps (fallback to legacy maxChangePercent if not provided)
      const upCap = (typeof upCapPercent === 'number') ? upCapPercent : maxChangePercent;
      const downCap = (typeof downCapPercent === 'number') ? downCapPercent : maxChangePercent;
      let recommended = baseRecommended;
      if (recommended > current && upCap > 0) {
        const maxUp = Math.round(current * (1 + upCap / 100));
        recommended = Math.min(recommended, maxUp);
      } else if (recommended < current && downCap > 0) {
        const maxDown = Math.round(current * (1 - downCap / 100));
        recommended = Math.max(recommended, maxDown);
      }

      if (roundToPack && roundToPack > 0) {
        const packs = Math.max(1, Math.round(recommended / roundToPack));
        recommended = packs * roundToPack;
      }
      if (!Number.isFinite(recommended)) recommended = current;

      if (recommended !== current) {
        // Persist update with POST JSON (serverless supports POST upsert)
        const postPayload = {
          warehouseId: bal.warehouseId,
          productId: bal.productId,
          qtyOnHand: bal.qtyOnHand,
          safetyStock: recommended
        } as const;
        try {
          await axios.post(`${base}/api/inventorybalance`, postPayload, { timeout: 30000 });
        } catch (e: any) {
          const status = e?.response?.status;
          const body = e?.response?.data ? JSON.stringify(e.response.data) : '';
          const msg = `POST ${base}/api/inventorybalance failed: ${status || 'ERR'} ${body}`;
          throw new Error(msg);
        }

        const product = productMap.get(bal.productId);
        const wh = warehouseMap.get(bal.warehouseId);
        const changePercent = current === 0 ? 100 : ((recommended - current) / Math.max(1, current)) * 100;
        changes.push({
          productId: bal.productId,
          productName: product?.name || 'Unknown',
          warehouseId: bal.warehouseId,
          warehouseName: wh?.name || 'Unknown',
          currentSafetyStock: current,
          recommendedSafetyStock: recommended,
          changePercent,
          reason: `z=${z.toFixed(2)}, σ_d=${stdDaily.toFixed(2)}, LT=${leadTimeDays}d, floor=${floorOp}`
        });

        // Record cooldown when decreasing
        if (recommended < current && typeof window !== 'undefined') {
          localStorage.setItem(coolKey(bal.warehouseId, bal.productId), String(Date.now()));
        }
      }
    }

    return {
      warehouseId,
      appliedCount: changes.length,
      totalCandidates: balances.length,
      changes: changes.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)),
      generatedAt: new Date().toISOString()
    };
  }
}

export default new ApiService();
