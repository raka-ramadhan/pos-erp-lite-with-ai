import { useSelector } from 'react-redux';
import type { RootState } from '../store';

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
