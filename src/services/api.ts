import axios, { AxiosInstance } from 'axios';
import {
  DashboardMetrics,
  InventoryValueByCategory,
  StockMovementData,
  TopProductData,
  WarehouseDistributionData,
  StockHealthData,
  UpcomingPOData
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
}

export default new ApiService();
