import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse, UserProfile } from '../types';
import { setAuth, logout, setAuthError, setUser } from '../store/slices/authSlice';
import { store } from '../store';
import type { AxiosError } from 'axios';

// Auth API functions
const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', {
      email: data.email,
      password: data.password,
      app: data.app || 'pos',
    });
    return response.data.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/auth/me');
    return response.data.data;
  },

  getMenu: async () => {
    const response = await apiClient.get('/auth/menu');
    return response.data.data;
  },
};

// Hook: Login
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      store.dispatch(setAuth({ user: data.user, token: data.accessToken }));
      queryClient.clear();
    },
    onError: (error: AxiosError) => {
      const errorResponse = error.response?.data as { message?: string } | undefined;
      let message = 'Login failed. Please check your credentials.';

      if (errorResponse?.message) {
        message = errorResponse.message;
      } else if (error.response?.status === 403) {
        message = 'Access denied. You do not have permission to access this application.';
      } else if (error.response?.status === 401) {
        message = 'Invalid credentials. Please check your email and password.';
      }

      store.dispatch(setAuthError(message));
    },
  });
}

// Hook: Get Full Profile
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook: Refresh Profile
export function useRefreshProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.getProfile,
    onSuccess: (data) => {
      store.dispatch(setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatar: data.avatar,
        role: data.role,
      }));
      queryClient.setQueryData(['profile'], data);
    },
  });
}

// Hook: Logout
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return Promise.resolve();
    },
    onSuccess: () => {
      store.dispatch(logout());
      queryClient.clear();
    },
  });
}
