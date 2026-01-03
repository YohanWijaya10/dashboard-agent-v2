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
  // Dynamic categories from backend; other keys are category names with numeric values
  [category: string]: string | number;
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

export interface ExecutiveSummaryResponse {
  summary: string;
  generatedAt: string;
}

export interface ProductHealthDetail {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  qtyOnHand: number;
  safetyStock: number;
  reorderPoint: number;
  status: 'Critical' | 'Warning';
  insight?: string;
}

export interface StockHealthDetailsResponse {
  critical: ProductHealthDetail[];
  warning: ProductHealthDetail[];
  generatedAt: string;
  totalCritical: number;
  totalWarning: number;
  warehouseFilter?: string;
}

export interface Warehouse {
  warehouseId: string;
  name: string;
  location?: string;
  isActive: boolean;
}

// Product Performance Analysis Types
export type PerformanceCategory = 'Star' | 'Cash Cow' | 'Question Mark' | 'Dog';

export interface ProductPerformanceData {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  turnoverRate: number;
  revenuePotential: number;
  totalIssued30Days: number;
  averageOnHand: number;
  latestUnitCost: number;
  performanceCategory: PerformanceCategory;
  warehouseId?: string;
  warehouseName?: string;
}

export interface PerformanceSummary {
  stars: number;
  cashCows: number;
  questionMarks: number;
  dogs: number;
  medianTurnover: number;
  medianRevenue: number;
}

export interface ProductPerformanceResponse {
  summary: PerformanceSummary;
  products: ProductPerformanceData[];
  topStars: ProductPerformanceData[];
  bottomDogs: ProductPerformanceData[];
  generatedAt: string;
  warehouseFilter?: string;
  categoryFilter?: string;
}

export interface ProductPerformanceInsightResponse {
  insights: string;
  topPerformers: string[];
  bottomPerformers: string[];
  recommendations: string[];
  generatedAt: string;
}

// Anomaly Detection Types
export type AnomalyType = 'unusual_transaction' | 'stockout' | 'price_variance';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface AnomalyItem {
  anomalyId: string;
  type: AnomalyType;
  productId: string;
  productName: string;
  warehouseId?: string;
  warehouseName?: string;
  severity: SeverityLevel;
  changePercentage: number;
  baselineValue: number;
  currentValue: number;
  detectedAt: string;
  description: string;
  insight?: string;
}

export interface AlertSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  totalCount: number;
}

export interface StockoutHistoryItem {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  stockoutDays: number;
  frequency: number;
  lastStockout: string | null;
  currentQty: number;
  safetyStock: number;
}

export interface AnomalyDetectionResponse {
  summary: AlertSummary;
  anomalies: AnomalyItem[];
  stockoutHistory: StockoutHistoryItem[];
  generatedAt: string;
}

export interface AnomalyInsightResponse {
  insights: string;
  topCriticalItems: string[];
  recommendations: string[];
  generatedAt: string;
}
