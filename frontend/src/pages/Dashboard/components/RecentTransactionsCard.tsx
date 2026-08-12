import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card, CardHeader, CardBody, Badge } from '../../../components/ui';
import { formatCurrency } from '../utils/formatCurrency';

interface RecentTransaction {
  id: string;
  transactionNumber: string;
  orderType: string;
  totalAmount: number;
  completedAt: string;
  paymentMethod: string;
}

interface RecentTransactionsCardProps {
  data: RecentTransaction[];
  isLoading?: boolean;
}

function getOrderTypeBadge(type: string) {
  switch (type) {
    case 'dine_in':
      return { variant: 'success' as const, label: 'Dine In' };
    case 'take_away':
      return { variant: 'warning' as const, label: 'Take Away' };
    default:
      return { variant: 'default' as const, label: type };
  }
}

function formatTime(dateStr: string): string {
  return format(new Date(dateStr), 'HH:mm', { locale: id });
}

export function RecentTransactionsCard({ data, isLoading }: RecentTransactionsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
        </CardHeader>
        <CardBody>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-200 rounded" />
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
      </CardHeader>
      <CardBody className="!px-0 !py-0">
        {data.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-400 text-sm">
            No transactions yet
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.map((tx) => {
              const badge = getOrderTypeBadge(tx.orderType);
              return (
                <div key={tx.id} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{tx.transactionNumber}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                      <span className="text-xs text-slate-400">{formatTime(tx.completedAt)}</span>
                      <span className="text-xs text-slate-400">• {tx.paymentMethod}</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-indigo-600">
                    {formatCurrency(tx.totalAmount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
