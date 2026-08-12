import { Card, CardHeader, CardBody, Badge } from '../../../components/ui';

interface ActiveOrderItem {
  id: string;
  orderNumber: string;
  orderType: string;
  tableName: string | null;
}

interface ActiveOrdersCardProps {
  data: {
    count: number;
    items: ActiveOrderItem[];
  };
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

export function ActiveOrdersCard({ data, isLoading }: ActiveOrdersCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Active Orders</h3>
        </CardHeader>
        <CardBody>
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-slate-200 rounded" />
            <div className="h-8 bg-slate-200 rounded" />
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Active Orders</h3>
          <Badge variant="info">{data.count}</Badge>
        </div>
      </CardHeader>
      <CardBody className="!px-0 !py-0">
        {data.items.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-400 text-sm">
            No active orders
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.items.map((order) => {
              const badge = getOrderTypeBadge(order.orderType);
              return (
                <div key={order.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{order.orderNumber}</p>
                    {order.tableName && (
                      <p className="text-xs text-slate-500">Meja {order.tableName}</p>
                    )}
                  </div>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
