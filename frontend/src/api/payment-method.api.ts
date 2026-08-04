import apiClient from './client';
import type { ApiResponse } from '../types';

export type PaymentType = 'cash' | 'e_wallet' | 'bank_transfer' | 'card' | 'qris' | 'other';

export interface PaymentMethod {
  id: string;
  outletId: string;
  code: string;
  name: string;
  description: string | null;
  paymentType: PaymentType;
  provider: string | null;
  iconUrl: string | null;
  isIntegration: boolean;
  minAmount: number | null;
  maxAmount: number | null;
  sortOrder: number;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QueryPaymentMethodParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'name' | 'code' | 'paymentType' | 'sortOrder' | 'createdAt';
  order?: 'ASC' | 'DESC';
  paymentType?: PaymentType;
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'all';
}

export interface PaginatedPaymentMethodResponse {
  data: PaymentMethod[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreatePaymentMethodDto {
  code: string;
  name: string;
  description?: string;
  paymentType: PaymentType;
  provider?: string;
  iconUrl?: string;
  isIntegration?: boolean;
  minAmount?: number;
  maxAmount?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdatePaymentMethodDto {
  code?: string;
  name?: string;
  description?: string;
  paymentType?: PaymentType;
  provider?: string;
  iconUrl?: string;
  isIntegration?: boolean;
  minAmount?: number;
  maxAmount?: number;
  sortOrder?: number;
  isActive?: boolean;
}

// Payment type display options
export const PAYMENT_TYPE_OPTIONS: Record<PaymentType, { label: string; icon: string }> = {
  cash: { label: 'Cash', icon: '💵' },
  e_wallet: { label: 'E-Wallet', icon: '📱' },
  bank_transfer: { label: 'Bank Transfer', icon: '🏦' },
  card: { label: 'Card', icon: '💳' },
  qris: { label: 'QRIS', icon: '📲' },
  other: { label: 'Other', icon: '📋' },
};

export default {
  getAll: async (params: QueryPaymentMethodParams = {}): Promise<PaginatedPaymentMethodResponse> => {
    const response = await apiClient.get('/payment-methods', { params });
    return {
      data: response.data.data || [],
      meta: response.data.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  },

  getAllActive: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get('/payment-methods/active');
    return response.data.data || [];
  },

  getOne: async (id: string): Promise<PaymentMethod> => {
    const response = await apiClient.get<ApiResponse<PaymentMethod>>(`/payment-methods/${id}`);
    return response.data.data;
  },

  create: async (data: CreatePaymentMethodDto): Promise<PaymentMethod> => {
    const response = await apiClient.post<ApiResponse<PaymentMethod>>('/payment-methods', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdatePaymentMethodDto): Promise<PaymentMethod> => {
    const response = await apiClient.patch<ApiResponse<PaymentMethod>>(`/payment-methods/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/payment-methods/${id}`);
    return response.data.data;
  },

  restore: async (id: string): Promise<PaymentMethod> => {
    const response = await apiClient.post<ApiResponse<PaymentMethod>>(`/payment-methods/${id}/restore`);
    return response.data.data;
  },
};
