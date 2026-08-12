import { useQuery } from '@tanstack/react-query';
import { getDashboardOverview, type DateRange } from '../api/dashboard.api';

export type { DateRange };

export interface UseDashboardOptions {
  range?: DateRange;
}

export function useDashboard(options: UseDashboardOptions = {}) {
  const { range = 'today' } = options;

  return useQuery({
    queryKey: ['dashboard', 'overview', range],
    queryFn: () => getDashboardOverview({ range }),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
}
