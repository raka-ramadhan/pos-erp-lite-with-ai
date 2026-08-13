import apiClient from './client';
import type { ApiResponse } from '../types';

// ============================================================================
// Types
// ============================================================================

export type OrderType = 'dine_in' | 'take_away' | 'delivery';

export interface TransactionModifier {
  id: string;
  modifierId: string;
  modifierName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface TransactionItem {
  id: string;
  productId: string;
  productName: string;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string | null;
  sortOrder: number;
  modifiers: TransactionModifier[];
}

export interface TransactionDiscount {
  discountId?: string | null;
  discountName?: string | null;
  discountType?: 'percentage' | 'fixed' | null;
  discountValue?: number | null;
  discountAmount: number;
}

export interface TransactionTax {
  taxId?: string | null;
  taxName?: string | null;
  taxRate?: number | null;
  taxAmount: number;
}

export interface TransactionPayment {
  id: string;
  paymentMethodId: string;
  paymentMethodName: string;
  paymentType: string;
  provider?: string | null;
  amount: number;
  totalAmount: number;
  changeAmount: number;
  referenceNumber?: string | null;
  cardNumber?: string | null;
  cardHolder?: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paidAt: string;
}

export interface TransactionSummary {
  id: string;
  transactionNumber: string;
  orderType: OrderType;
  tableCode?: string | null;
  tableName?: string | null;
  cashierName?: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  orderedAt: string;
  completedAt?: string | null;
  itemCount: number;
  paymentStatus: 'paid' | 'unpaid';
}

export interface TransactionDetail {
  id: string;
  transactionNumber: string;
  orderId: string | null;
  orderNumber: string | null;
  orderType: OrderType;
  tableId?: string | null;
  tableCode?: string | null;
  tableName?: string | null;
  cashierId?: string | null;
  cashierName?: string | null;
  subtotal: number;
  discount: TransactionDiscount;
  tax: TransactionTax;
  totalAmount: number;
  notes?: string | null;
  orderedAt: string;
  completedAt?: string | null;
  items: TransactionItem[];
  payments: TransactionPayment[];
}

export interface PaginatedTransactions {
  data: TransactionSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TransactionListParams {
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  orderType?: OrderType;
}

// ============================================================================
// API Client
// ============================================================================

export const transactionsApi = {
  /**
   * GET /api/transactions - List transactions with optional filters
   */
  getList: async (params?: TransactionListParams): Promise<PaginatedTransactions> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
    if (params?.orderType) searchParams.set('orderType', params.orderType);

    const response = await apiClient.get<{
      success: boolean;
      data: TransactionSummary[];
      meta: PaginatedTransactions['meta'];
      timestamp: string;
    }>(`/transactions?${searchParams}`);

    // Backend interceptor flattens paginated responses: data is the array, meta is at top level
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  /**
   * GET /api/transactions/:id - Get transaction detail
   */
  getById: async (id: string): Promise<TransactionDetail> => {
    const response = await apiClient.get<ApiResponse<TransactionDetail>>(
      `/transactions/${id}`
    );
    return response.data.data as TransactionDetail;
  },

  /**
   * GET /api/transactions/:id/receipt - Get receipt data
   */
  getReceipt: async (id: string): Promise<TransactionDetail> => {
    const response = await apiClient.get<ApiResponse<TransactionDetail>>(
      `/transactions/${id}/receipt`
    );
    return response.data.data as TransactionDetail;
  },
};

export default transactionsApi;
