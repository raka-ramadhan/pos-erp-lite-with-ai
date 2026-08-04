import apiClient from './client';
import type { ApiResponse } from '../types';

export interface Tax {
  id: string;
  code: string;
  name: string;
  taxType: string;
  rate: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface ModifierGroup {
  id: string;
  name: string;
  slug: string;
  selectionType: string;
  isRequired: boolean;
  minSelections: number | null;
  maxSelections: number | null;
  modifierCount?: number;
}

export interface CategorySimple {
  id: string;
  name: string;
}

export interface ProductResponse {
  id: string;
  outletId: string | null;
  categoryId: string;
  category: CategorySimple | null;
  sku: string | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  mediaId: string | null;
  price: number;
  costPrice: number | null;
  unitType: string;
  hasVariants: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime: number | null;
  sortOrder: number;
  isActive: boolean;
  taxes: Tax[];
  modifierGroups: ModifierGroup[];
  modifierGroupCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueryProductParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'name' | 'sku' | 'price' | 'sortOrder' | 'createdAt' | 'updatedAt';
  order?: 'ASC' | 'DESC';
  categoryId?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  status?: 'active' | 'inactive' | 'all';
}

export interface PaginatedProductResponse {
  data: ProductResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateProductDto {
  name: string;
  sku?: string;
  slug?: string;
  description?: string;
  categoryId: string;
  mediaId?: string;
  price: number;
  costPrice?: number;
  unitType?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  preparationTime?: number;
  sortOrder?: number;
  isActive?: boolean;
  taxIds?: string[];
  modifierGroupIds?: string[];
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  mediaId?: string | null;
  price?: number;
  costPrice?: number;
  unitType?: string;
  hasVariants?: boolean;
  isAvailable?: boolean;
  isFeatured?: boolean;
  preparationTime?: number;
  sortOrder?: number;
  isActive?: boolean;
  taxIds?: string[];
  modifierGroupIds?: string[];
}

export default {
  getAll: async (params: QueryProductParams = {}): Promise<PaginatedProductResponse> => {
    const response = await apiClient.get('/products', { params });
    return {
      data: response.data.data || [],
      meta: response.data.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  },

  getAllActive: async (): Promise<ProductResponse[]> => {
    const response = await apiClient.get('/products/active');
    return response.data.data || [];
  },

  getOne: async (id: string): Promise<ProductResponse> => {
    const response = await apiClient.get<ApiResponse<ProductResponse>>(`/products/${id}`);
    return response.data.data;
  },

  create: async (data: CreateProductDto): Promise<ProductResponse> => {
    const response = await apiClient.post<ApiResponse<ProductResponse>>('/products', data);
    return response.data.data;
  },

  createWithImage: async (data: CreateProductDto, imageFile: File): Promise<ProductResponse> => {
    const formData = new FormData();
    // Append all product fields individually
    formData.append('name', data.name);
    formData.append('categoryId', data.categoryId);
    formData.append('price', String(data.price));
    formData.append('unitType', data.unitType || 'unit');
    formData.append('isAvailable', String(data.isAvailable ?? true));
    formData.append('isFeatured', String(data.isFeatured ?? false));
    formData.append('sortOrder', String(data.sortOrder ?? 0));
    formData.append('isActive', String(data.isActive ?? true));
    formData.append('taxIds', JSON.stringify(data.taxIds || []));
    formData.append('modifierGroupIds', JSON.stringify(data.modifierGroupIds || []));

    if (data.sku) formData.append('sku', data.sku);
    if (data.slug) formData.append('slug', data.slug);
    if (data.description) formData.append('description', data.description);
    if (data.costPrice !== undefined) formData.append('costPrice', String(data.costPrice));
    if (data.preparationTime !== undefined) formData.append('preparationTime', String(data.preparationTime));

    // Append image file
    formData.append('image', imageFile);

    // Don't set Content-Type header - axios will auto-set multipart/form-data with boundary
    const response = await apiClient.post<ApiResponse<ProductResponse>>('/products/with-image', formData);
    return response.data.data;
  },

  update: async (id: string, data: UpdateProductDto): Promise<ProductResponse> => {
    const response = await apiClient.patch<ApiResponse<ProductResponse>>(`/products/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/products/${id}`);
    return response.data.data;
  },

  restore: async (id: string): Promise<ProductResponse> => {
    const response = await apiClient.post<ApiResponse<ProductResponse>>(`/products/${id}/restore`);
    return response.data.data;
  },
};
