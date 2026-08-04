import apiClient from './client';
import type { ApiResponse } from '../types';

export interface Tax {
  id: string;
  outletId: string | null;
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
  createdAt: string;
  updatedAt: string;
}

export default {
  getAllActive: async (): Promise<Tax[]> => {
    const response = await apiClient.get('/taxes/active');
    return response.data.data || [];
  },

  getOne: async (id: string): Promise<Tax> => {
    const response = await apiClient.get<ApiResponse<Tax>>(`/taxes/${id}`);
    return response.data.data;
  },
};
