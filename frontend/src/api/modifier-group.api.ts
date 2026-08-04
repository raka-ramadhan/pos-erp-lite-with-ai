import apiClient from './client';
import type { ApiResponse } from '../types';

export interface ModifierGroup {
  id: string;
  outletId: string | null;
  name: string;
  slug: string;
  description: string | null;
  selectionType: string;
  isRequired: boolean;
  minSelections: number | null;
  maxSelections: number | null;
  sortOrder: number;
  isActive: boolean;
  modifiers?: Modifier[];
  createdAt: string;
  updatedAt: string;
}

export interface Modifier {
  id: string;
  modifierGroupId: string;
  sku: string | null;
  name: string;
  description: string | null;
  additionalPrice: number;
  costPrice: number | null;
  isDefault: boolean;
  isAvailable: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default {
  getAllActive: async (): Promise<ModifierGroup[]> => {
    const response = await apiClient.get('/modifier-groups/active');
    return response.data.data || [];
  },

  getOne: async (id: string): Promise<ModifierGroup> => {
    const response = await apiClient.get<ApiResponse<ModifierGroup>>(`/modifier-groups/${id}`);
    return response.data.data;
  },
};
