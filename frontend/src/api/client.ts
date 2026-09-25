import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError, type AxiosResponse } from 'axios';
import { store } from '../store';
import { logout, setAuthError } from '../store/slices/authSlice';

// API Base URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Flag to prevent 401 interceptor from firing during logout
let isLoggingOut = false;

export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from Redux store
    const state = store.getState();
    const token = state.auth.token;

    // Add Authorization header if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If sending FormData, let axios set Content-Type automatically
    // by deleting the Content-Type header (axios will auto-detect multipart)
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Skip 401 handling if we're in the process of logging out
    // This prevents "Access Denied" flash during logout
    if (isLoggingOut) {
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response as AxiosResponse;

      switch (status) {
        case 401:
          // Unauthorized - Clear auth state and redirect to login
          store.dispatch(logout());
          store.dispatch(setAuthError('Session expired. Please login again.'));

          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden
          store.dispatch(setAuthError('Access denied. You do not have permission.'));
          break;

        case 500:
          // Internal Server Error
          store.dispatch(setAuthError('Server error. Please try again later.'));
          break;

        case 404:
          // Not Found
          if (data && typeof data === 'object' && 'message' in data) {
            store.dispatch(setAuthError((data as { message: string }).message));
          }
          break;

        default:
          // Handle other errors
          if (data && typeof data === 'object' && 'message' in data) {
            store.dispatch(setAuthError((data as { message: string }).message));
          }
          break;
      }
    } else if (error.request) {
      // Network error
      store.dispatch(setAuthError('Network error. Please check your connection.'));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
