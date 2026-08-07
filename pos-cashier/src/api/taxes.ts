import { apiClient } from './client';
import type { ApiResponse } from '../types';

// Tax types
export interface Tax {
  id: string;
  code: string;
  name: string;
  description: string | null;
  taxType: string;
  rate: number;
  isDefault: boolean;
  calculationBase: string;
  calculationOrder: number;
  isInclusive: boolean;
  isActive: boolean;
}

// Taxes API
const taxesApi = {
  // Get all active taxes
  getActiveTaxes: async (): Promise<Tax[]> => {
    const response = await apiClient.get<ApiResponse<Tax[]>>('/taxes/active');
    return response.data.data;
  },

  // Get tax by ID
  getTax: async (id: string): Promise<Tax> => {
    const response = await apiClient.get<ApiResponse<Tax>>(`/taxes/${id}`);
    return response.data.data;
  },
};

export default taxesApi;
