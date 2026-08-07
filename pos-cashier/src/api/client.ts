import axios from 'axios';
import { store } from '../store';
import { logout, setAuthError } from '../store/slices/authSlice';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Add Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Auto-detect FormData content-type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          store.dispatch(logout());
          window.location.href = '/login';
          break;
        case 403:
          store.dispatch(setAuthError('Access denied. You do not have permission.'));
          break;
        case 404:
          store.dispatch(setAuthError('Resource not found.'));
          break;
        case 500:
          store.dispatch(setAuthError('Server error. Please try again later.'));
          break;
        default:
          break;
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient };
