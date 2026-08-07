import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../api';
import type {
  Product,
  ProductWithModifiers,
  Category,
  ApiResponse,
} from '../types';

// Product API functions
const productApi = {
  // Get all active products
  getProducts: async (params?: {
    category_id?: string;
    search?: string;
  }): Promise<Product[]> => {
    const searchParams = new URLSearchParams();
    if (params?.category_id) {
      searchParams.append('category_id', params.category_id);
    }
    if (params?.search) {
      searchParams.append('search', params.search);
    }

    const queryString = searchParams.toString();
    const url = `/products/active${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ApiResponse<Product[]>>(url);
    return response.data.data;
  },

  // Get product with full modifier details for POS
  getProductWithModifiers: async (id: string): Promise<ProductWithModifiers> => {
    const response = await apiClient.get<ApiResponse<ProductWithModifiers>>(
      `/products/${id}/with-modifiers`
    );
    return response.data.data;
  },

  // Get product detail with modifiers
  getProductDetail: async (id: string): Promise<ProductWithModifiers> => {
    const response = await apiClient.get<ApiResponse<ProductWithModifiers>>(
      `/products/${id}`
    );
    return response.data.data;
  },

  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories/active');
    return response.data.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId: string): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `/products/active?category_id=${categoryId}`
    );
    return response.data.data;
  },
};

// Hook: Get all products
export function useProducts(params?: { category_id?: string; search?: string }) {
  return useQuery({
    queryKey: ['products', 'active', params],
    queryFn: () => productApi.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook: Get product detail with modifiers
export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productApi.getProductDetail(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook: Get product with modifiers (POS-specific endpoint)
export function useProductWithModifiers(id: string) {
  return useQuery({
    queryKey: ['products', id, 'with-modifiers'],
    queryFn: () => productApi.getProductWithModifiers(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook: Get all categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories', 'active'],
    queryFn: productApi.getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes (categories don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook: Get products by category
export function useProductsByCategory(categoryId: string) {
  return useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: () => productApi.getProductsByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook: Prefetch products
export function usePrefetchProducts() {
  return useMutation({
    mutationFn: async (params?: { category_id?: string; search?: string }) => {
      // This will be called to prefetch
      return productApi.getProducts(params);
    },
  });
}
