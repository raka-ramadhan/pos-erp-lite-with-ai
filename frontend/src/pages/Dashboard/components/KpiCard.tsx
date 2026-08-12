import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardBody } from '../../../components/ui';
import { cn } from '../../../utils/cn';

interface KpiCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  isLoading?: boolean;
}

export function KpiCard({ title, value, change, icon: Icon, isLoading }: KpiCardProps) {
  const isPositive = change !== undefined && change >= 0;

  if (isLoading) {
    return (
      <Card>
        <CardBody className="!px-6 !py-5">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-20 mb-2" />
            <div className="h-8 bg-slate-200 rounded w-32 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-16" />
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardBody className="!px-6 !py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={cn(
                  'text-sm font-medium',
                  isPositive ? 'text-green-500' : 'text-red-500'
                )}>
                  {isPositive ? '+' : ''}{change.toFixed(1)}%
                </span>
                <span className="text-sm text-slate-400">vs yesterday</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Icon className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
