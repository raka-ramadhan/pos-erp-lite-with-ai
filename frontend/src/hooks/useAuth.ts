import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../types';
import { setAuth, logout, setAuthError } from '../store/slices/authSlice';
import { store } from '../store';
import type { AxiosError } from 'axios';

// Auth API functions
const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  },

  getProfile: async () => {
    const response = await apiClient.get<ApiResponse<AuthResponse['user']>>('/auth/profile');
    return response.data.data;
  },
};

// Hook: Login
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Update Redux state
      store.dispatch(setAuth({ user: data.user, token: data.accessToken }));
      // Clear any cached queries
      queryClient.clear();
    },
    onError: (error: AxiosError) => {
      const message = (error.response?.data as { message?: string })?.message || 'Login failed';
      store.dispatch(setAuthError(message));
    },
  });
}

// Hook: Register
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      store.dispatch(setAuth({ user: data.user, token: data.accessToken }));
      queryClient.clear();
    },
    onError: (error: AxiosError) => {
      const message = (error.response?.data as { message?: string })?.message || 'Registration failed';
      store.dispatch(setAuthError(message));
    },
  });
}

// Hook: Get Profile
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook: Logout
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Optionally call logout API endpoint
      return Promise.resolve();
    },
    onSuccess: () => {
      store.dispatch(logout());
      queryClient.clear();
    },
  });
}
