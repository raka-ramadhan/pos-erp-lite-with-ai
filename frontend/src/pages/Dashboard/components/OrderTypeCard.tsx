import { Card, CardHeader, CardBody, Badge } from '../../../components/ui';

interface OrderTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

interface OrderTypeCardProps {
  data: OrderTypeDistribution[];
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

export function OrderTypeCard({ data, isLoading }: OrderTypeCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Order Types</h3>
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
        <h3 className="text-lg font-semibold text-slate-900">Order Types</h3>
      </CardHeader>
      <CardBody>
        {data.length === 0 ? (
          <p className="text-slate-400 text-sm">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {data.map((item) => {
              const badge = getOrderTypeBadge(item.type);
              return (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <span className="text-sm text-slate-600">{item.count}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">{item.percentage}%</span>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
