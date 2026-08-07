import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse, UserProfile } from '../types';
import { setAuth, logout, setAuthError, setUser } from '../store/slices/authSlice';
import { store } from '../store';
import type { AxiosError } from 'axios';

// Auth API functions
const authApi = {
  login: async (data: LoginRequest & { app?: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', {
      email: data.email,
      password: data.password,
      app: data.app || 'dashboard',
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

  getRoles: async () => {
    const response = await apiClient.get('/auth/roles');
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

// Hook: Get Full Profile (with permissions and menu)
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook: Refresh Profile after login (to get full profile with permissions)
export function useRefreshProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.getProfile,
    onSuccess: (data) => {
      // Update stored user with full profile data
      store.dispatch(setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatar: data.avatar,
        role: data.role,
      }));
      // Update profile cache
      queryClient.setQueryData(['profile'], data);
    },
  });
}

// Hook: Get Menu
export function useMenu() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: authApi.getMenu,
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook: Get Roles
export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: authApi.getRoles,
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
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
