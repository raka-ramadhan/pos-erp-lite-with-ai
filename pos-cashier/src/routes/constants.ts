export const ROUTES = {
  LOGIN: '/login',
  FORBIDDEN: '/forbidden',
  POS: '/pos',
  POS_HISTORY: '/pos/history',
} as const;

// Transaction detail route helper - export separately to avoid type issues
export const getTransactionDetailRoute = (id: string) => `/pos/history/${id}`;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
