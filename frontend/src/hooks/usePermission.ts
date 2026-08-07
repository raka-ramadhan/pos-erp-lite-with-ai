import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { APP_PERMISSIONS } from '../types';

/**
 * Check if current user has a specific permission
 */
export function useHasPermission(permission: string): boolean {
  const user = useSelector((state: RootState) => state.auth.user);
  const permissions = user?.role?.permissions || [];
  return permissions.includes(permission);
}

/**
 * Check if current user has ALL of the specified permissions
 */
export function useHasAllPermissions(permissions: string[]): boolean {
  const user = useSelector((state: RootState) => state.auth.user);
  const userPermissions = user?.role?.permissions || [];
  return permissions.every((p) => userPermissions.includes(p));
}

/**
 * Check if current user has ANY of the specified permissions
 */
export function useHasAnyPermission(permissions: string[]): boolean {
  const user = useSelector((state: RootState) => state.auth.user);
  const userPermissions = user?.role?.permissions || [];
  return permissions.some((p) => userPermissions.includes(p));
}

/**
 * Get all permissions of current user
 */
export function usePermissions(): string[] {
  const user = useSelector((state: RootState) => state.auth.user);
  return user?.role?.permissions || [];
}

/**
 * Check if current user can access Dashboard application
 * Requires use_dashboard permission
 */
export function useCanAccessDashboard(): boolean {
  const user = useSelector((state: RootState) => state.auth.user);
  const permissions = user?.role?.permissions || [];
  return permissions.includes(APP_PERMISSIONS.USE_DASHBOARD);
}

/**
 * Check if current user can access POS Cashier application
 * Requires use_cashier permission
 */
export function useCanAccessCashier(): boolean {
  const user = useSelector((state: RootState) => state.auth.user);
  const permissions = user?.role?.permissions || [];
  return permissions.includes(APP_PERMISSIONS.USE_CASHIER);
}

/**
 * Get current user's role code
 */
export function useUserRoleCode(): string | null {
  const user = useSelector((state: RootState) => state.auth.user);
  return user?.role?.code || null;
}
