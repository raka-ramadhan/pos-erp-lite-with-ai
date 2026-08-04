/**
 * Route path constants
 */
export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Dashboard routes
  DASHBOARD: '/dashboard',
  DASHBOARD_HOME: '/dashboard',
  CATEGORIES: '/dashboard/categories',

  HOME: '/',
  DEFAULT: '/login',
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
