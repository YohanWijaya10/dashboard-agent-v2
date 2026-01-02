// Dashboard Metrics
export interface DashboardMetrics {
  totalInventoryValue: number;
  totalActiveProducts: number;
  productsBelowSafetyStock: number;
  pendingPOValue: number;
  totalActiveSuppliers: number;
  totalWarehouses: number;
}

export interface InventoryValueByCategory {
  category: string;
  value: number;
  percentage: number;
}

export interface StockMovementData {
  date: string;
  receipt: number;
  issue: number;
  net: number;
}

export interface TopProductData {
  productId: string;
  productName: string;
  sku: string;
  value: number;
  qty: number;
}

export interface WarehouseDistributionData {
  warehouseName: string;
  'Raw Material': number;
  'Additive': number;
  'Packaging': number;
  'Finished Goods': number;
}

export type StockHealthStatus = 'OK' | 'Warning' | 'Critical';

export interface StockHealthData {
  status: StockHealthStatus;
  count: number;
  percentage: number;
}

export interface UpcomingPOData {
  poId: string;
  supplierName: string;
  expectedDate: string;
  totalValue: number;
  itemCount: number;
  status: string;
}

// Chat Types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  response: string;
  suggestions?: string[];
  data?: any;
}
