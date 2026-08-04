import { Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui';
import { cn } from '../../utils/cn';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
}

function StatCard({ title, value, change, icon: Icon }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardBody className="!px-6 !py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
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
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-slate-400">vs last month</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Icon className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

interface ActivityItem {
  id: number;
  user: string;
  action: string;
  time: string;
  avatar: string;
}

const recentActivities: ActivityItem[] = [
  { id: 1, user: 'Sarah Wilson', action: 'Created a new order #1234', time: '2 minutes ago', avatar: 'SW' },
  { id: 2, user: 'Michael Brown', action: 'Updated product "MacBook Pro"', time: '15 minutes ago', avatar: 'MB' },
  { id: 3, user: 'Emily Davis', action: 'Added new category "Electronics"', time: '1 hour ago', avatar: 'ED' },
  { id: 4, user: 'James Wilson', action: 'Processed refund for order #1198', time: '2 hours ago', avatar: 'JW' },
  { id: 5, user: 'Lisa Anderson', action: 'Registered new user account', time: '3 hours ago', avatar: 'LA' },
];

export function DashboardHome() {
  useDocumentTitle('Dashboard');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">Dashboard / Home</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Users"
          value="10,234"
          change={12.5}
          icon={Users}
        />
        <StatCard
          title="Total Products"
          value="5,678"
          change={8.2}
          icon={Package}
        />
        <StatCard
          title="Total Orders"
          value="3,456"
          change={-2.3}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Revenue"
          value="$45,678"
          change={15.8}
          icon={DollarSign}
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          <p className="text-sm text-slate-500 mt-1">Latest actions from your team</p>
        </CardHeader>
        <CardBody className="!px-0 !py-0">
          <div className="divide-y divide-slate-100">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">{activity.avatar}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{activity.user}</p>
                  <p className="text-sm text-slate-500 truncate">{activity.action}</p>
                </div>

                {/* Time */}
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
