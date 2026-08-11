import { apiClient } from './client';
import type { ApiResponse } from '../types';

// Transaction Types
export interface TransactionSummary {
  id: string;
  transactionNumber: string;
  orderType: 'dine_in' | 'take_away' | 'delivery';
  tableCode?: string | null;
  tableName?: string | null;
  paymentMethod?: string | null;
  totalAmount: number;
  completedAt: string;
}

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

export interface TransactionDetail {
  id: string;
  transactionNumber: string;
  orderId: string;
  orderNumber: string;
  orderType: 'dine_in' | 'take_away' | 'delivery';
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
  completedAt: string;
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
  orderType?: 'dine_in' | 'take_away' | 'delivery';
}

// API Methods
const transactionsApi = {
  /**
   * GET /api/transactions - List transactions with optional filters
   */
  getList: async (params?: TransactionListParams): Promise<PaginatedTransactions> => {
    const response = await apiClient.get<ApiResponse<PaginatedTransactions>>('/transactions', {
      params,
    });
    return response.data.data;
  },

  /**
   * GET /api/transactions/:id - Get transaction detail
   */
  getById: async (id: string): Promise<TransactionDetail> => {
    const response = await apiClient.get<ApiResponse<TransactionDetail>>(`/transactions/${id}`);
    return response.data.data;
  },

  /**
   * GET /api/transactions/:id/receipt - Get transaction receipt (same as detail)
   */
  getReceipt: async (id: string): Promise<TransactionDetail> => {
    const response = await apiClient.get<ApiResponse<TransactionDetail>>(
      `/transactions/${id}/receipt`
    );
    return response.data.data;
  },
};

export default transactionsApi;
