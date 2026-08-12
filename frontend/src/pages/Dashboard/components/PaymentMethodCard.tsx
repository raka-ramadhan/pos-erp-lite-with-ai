import { Card, CardHeader, CardBody } from '../../../components/ui';
import { formatCurrency } from '../utils/formatCurrency';

interface PaymentMethodDistribution {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

interface PaymentMethodCardProps {
  data: PaymentMethodDistribution[];
  isLoading?: boolean;
}

export function PaymentMethodCard({ data, isLoading }: PaymentMethodCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Payment Methods</h3>
        </CardHeader>
        <CardBody>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-3/4" />
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-slate-900">Payment Methods</h3>
      </CardHeader>
      <CardBody>
        {data.length === 0 ? (
          <p className="text-slate-400 text-sm">No payments yet</p>
        ) : (
          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.method} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.method}</p>
                  <p className="text-xs text-slate-500">{item.count} transactions</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{formatCurrency(item.total)}</p>
                  <p className="text-xs text-slate-500">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
