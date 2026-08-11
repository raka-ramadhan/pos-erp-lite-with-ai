export const ROUTES = {
  LOGIN: '/login',
  FORBIDDEN: '/forbidden',
  POS: '/pos',
  POS_HISTORY: '/pos/history',
  POS_TRANSACTION_DETAIL: (id: string) => `/pos/history/${id}`,
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
