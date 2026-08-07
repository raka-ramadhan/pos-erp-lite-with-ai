import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Helper to restore user from localStorage
function getStoredUser(): User | null {
  const userStr = localStorage.getItem('cashier_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

const storedToken = localStorage.getItem('cashier_token');
const storedUser = getStoredUser();

const initialState: AuthState = {
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!(storedToken && storedUser),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.error = null;
    },
    setAuth: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      // Persist to localStorage
      localStorage.setItem('cashier_token', action.payload.token);
      localStorage.setItem('cashier_user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      // Clear localStorage
      localStorage.removeItem('cashier_token');
      localStorage.removeItem('cashier_user');
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('cashier_user', JSON.stringify(action.payload));
    },
  },
});

export const {
  setLoading,
  setAuth,
  logout,
  setAuthError,
  clearError,
  setUser,
} = authSlice.actions;

export default authSlice.reducer;
