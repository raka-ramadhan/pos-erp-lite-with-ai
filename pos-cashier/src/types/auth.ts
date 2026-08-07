// User role info
export interface UserRole {
  id: string;
  code: string;
  name: string;
  permissions: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole | null;
}

// User profile from /auth/me endpoint
export interface UserProfile extends User {
  permissions: string[];
  menu: MenuItemResponse[];
}

// Menu item for user profile
export interface MenuItemResponse {
  id: string;
  name: string;
  code: string;
  description: string;
  type: string;
  icon: string;
  path: string;
  sortOrder: number;
  isActive: boolean;
  isHidden: boolean;
  children: MenuItemResponse[];
}

export interface LoginRequest {
  email: string;
  password: string;
  app: 'dashboard' | 'pos';
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[];
  timestamp: string;
}

// Application access permissions
export const APP_PERMISSIONS = {
  USE_DASHBOARD: 'use_dashboard',
  USE_CASHIER: 'use_cashier',
} as const;

export type AppPermission = typeof APP_PERMISSIONS[keyof typeof APP_PERMISSIONS];
