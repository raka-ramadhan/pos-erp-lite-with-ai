// User role info
export interface UserRole {
  id: string;
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

export interface LoginRequest {
  email: string;
  password: string;
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

// RBAC Types
export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string | null;
  group: string;
  isActive: boolean;
  sortOrder: number;
  rolesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  code: string;
  description: string;
  type: 'GROUP' | 'MENU' | 'SUBMENU' | 'LINK';
  icon: string;
  path: string;
  sortOrder: number;
  isActive: boolean;
  isHidden: boolean;
  parentId: string | null;
  children: MenuItem[];
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  permissions: Permission[];
  usersCount?: number;
  permissionsCount?: number;
  createdAt: string;
  updatedAt: string;
}
