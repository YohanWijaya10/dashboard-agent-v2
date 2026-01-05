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
    try {
      const response = await this.client.post<import('../types').SafetyStockAutoAdjustResponse>(
        '/api/dashboard/safety-stock-auto-adjust',
        { warehouseId, policy },
        { timeout: 30000 }
      );
      return response.data;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        // Fallback: compute and patch directly to serverless DB API
        return await this.clientSideAutoAdjust(warehouseId, policy);
      }
      throw err;
    }
  }

  private async clientSideAutoAdjust(
    warehouseId: string,
    policy?: Partial<import('../types').SafetyStockPolicy>
  ): Promise<import('../types').SafetyStockAutoAdjustResponse> {
    const {
      serviceLevel = 0.95,
      leadTimeDays = 7,
      maxChangePercent = 20,
      roundToPack = null,
      minSafetyStock = 0
    } = policy || {};

    const base = 'https://serverless-twg8.vercel.app';

    // Fetch data needed
    type ProductLite = { productId: string; name: string; sku?: string };
    const [balancesRes, trxRes, prodsRes, whsRes] = await Promise.all([
      axios.get<import('../types').InventoryBalance[]>(`${base}/api/inventorybalance`, { timeout: 30000 }),
      axios.get<import('../types').InventoryTransaction[]>(`${base}/api/inventorytransaction`, { timeout: 30000 }),
      axios.get<ProductLite[]>(`${base}/api/products`, { timeout: 30000 }),
      axios.get<import('../types').Warehouse[]>(`${base}/api/warehouses`, { timeout: 30000 })
    ]);

    const balances = balancesRes.data
      .map(b => ({
        ...b,
        qtyOnHand: Number(b.qtyOnHand),
        qtyReserved: Number(b.qtyReserved),
        safetyStock: Number(b.safetyStock),
        reorderPoint: Number(b.reorderPoint)
      }))
      .filter(b => b.warehouseId === warehouseId);

    const transactions = trxRes.data.map(t => ({ ...t, qty: Number(t.qty) }));
    const products = prodsRes.data;
    const warehouses = whsRes.data;

    const productMap = new Map(products.map(p => [p.productId, p]));
    const warehouseMap = new Map(warehouses.map(w => [w.warehouseId, w]));

    // Build last 30 days date keys
    const windowDays = 30;
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

    for (const bal of balances) {
      const daily = dates.map(date => issueByKey.get(`${date}|${bal.productId}|${bal.warehouseId}`) || 0);
      const sorted = [...daily].sort((a, b) => a - b);
      const p95 = sorted[Math.floor(0.95 * (sorted.length - 1))] || 0;
      const clamped = daily.map(v => Math.min(v, p95));
      const mean = clamped.reduce((s, v) => s + v, 0) / (clamped.length || 1);
      const variance = clamped.reduce((s, v) => s + (v - mean) * (v - mean), 0) / Math.max(1, clamped.length - 1);
      const stdDaily = Math.sqrt(variance);

      const sigmaLT = stdDaily * Math.sqrt(Math.max(1, leadTimeDays));
      let recommended = Math.max(minSafetyStock, Math.round(z * sigmaLT));

      const current = Number(bal.safetyStock) || 0;
      if (maxChangePercent > 0) {
        const maxUp = Math.round(current * (1 + maxChangePercent / 100));
        const maxDown = Math.round(current * (1 - maxChangePercent / 100));
        recommended = Math.min(recommended, maxUp);
        recommended = Math.max(recommended, maxDown);
      }
      if (roundToPack && roundToPack > 0) {
        const packs = Math.max(1, Math.round(recommended / roundToPack));
        recommended = packs * roundToPack;
      }
      if (!Number.isFinite(recommended)) recommended = current;

      if (recommended !== current) {
        // Persist via PATCH
        await axios.patch(`${base}/api/inventorybalance`, {
          warehouseId: bal.warehouseId,
          productId: bal.productId,
          safetyStock: recommended
        }, { timeout: 30000 });

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
          reason: `z=${z.toFixed(2)}, σ_d=${stdDaily.toFixed(2)}, LT=${leadTimeDays}d`
        });
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
