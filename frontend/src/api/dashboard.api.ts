import apiClient from './client';

export interface SalesMetrics {
  value: number;
  previousValue: number;
  change: number;
}

export interface OrderMetrics {
  value: number;
  previousValue: number;
  change: number;
}

export interface TransactionMetrics {
  value: number;
}

export interface ActiveOrderItem {
  id: string;
  orderNumber: string;
  orderType: string;
  tableName: string | null;
}

export interface ActiveOrders {
  count: number;
  items: ActiveOrderItem[];
}

export interface OrderTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface PaymentMethodDistribution {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

export interface RecentTransaction {
  id: string;
  transactionNumber: string;
  orderType: string;
  totalAmount: number;
  completedAt: string;
  paymentMethod: string;
}

export interface TableStats {
  total: number;
  occupied: number;
  available: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface DashboardOverviewData {
  sales: SalesMetrics;
  orders: OrderMetrics;
  transactions: TransactionMetrics;
  activeOrders: ActiveOrders;
  orderTypes: OrderTypeDistribution[];
  paymentMethods: PaymentMethodDistribution[];
  recentTransactions: RecentTransaction[];
  tableStats: TableStats;
  chartData: ChartDataPoint[];
}

export interface DashboardOverviewResponse {
  success: boolean;
  data: DashboardOverviewData;
  meta: {
    range: string;
    generatedAt: string;
  };
}

export type DateRange = 'today' | '7d' | '30d';

export interface GetDashboardOverviewParams {
  range?: DateRange;
}

export const getDashboardOverview = async (params?: GetDashboardOverviewParams): Promise<DashboardOverviewData> => {
  const response = await apiClient.get<DashboardOverviewResponse>('/dashboard/overview', {
    params,
  });
  return response.data.data;
};
