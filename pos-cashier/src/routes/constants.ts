export const ROUTES = {
  LOGIN: '/login',
  FORBIDDEN: '/forbidden',
  POS: '/pos',
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
