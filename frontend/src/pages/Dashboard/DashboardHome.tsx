import { useState } from 'react';
import { RefreshCw, DollarSign, ShoppingCart, Receipt, ClipboardList } from 'lucide-react';
import { useDashboard, type DateRange } from '../../hooks/useDashboard';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { KpiCard } from './components/KpiCard';
import { SalesChart } from './components/SalesChart';
import { OrderTypeCard } from './components/OrderTypeCard';
import { PaymentMethodCard } from './components/PaymentMethodCard';
import { ActiveOrdersCard } from './components/ActiveOrdersCard';
import { RecentTransactionsCard } from './components/RecentTransactionsCard';
import { formatCurrency } from './utils/formatCurrency';

const DATE_RANGES: { key: DateRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
];

export function DashboardHome() {
  useDocumentTitle('Dashboard');
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const { data, isLoading, isError, refetch, isFetching } = useDashboard({ range: dateRange });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Overview & Analytics</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {DATE_RANGES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDateRange(key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  dateRange === key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-slate-600 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KpiCard
          title="Sales"
          value={data ? formatCurrency(data.sales.value) : 'Rp 0'}
          change={data?.sales.change}
          icon={DollarSign}
          isLoading={isLoading}
        />
        <KpiCard
          title="Orders"
          value={data ? String(data.orders.value) : '0'}
          change={data?.orders.change}
          icon={ShoppingCart}
          isLoading={isLoading}
        />
        <KpiCard
          title="Transactions"
          value={data ? String(data.transactions.value) : '0'}
          icon={Receipt}
          isLoading={isLoading}
        />
        <KpiCard
          title="Active Orders"
          value={data ? String(data.activeOrders.count) : '0'}
          icon={ClipboardList}
          isLoading={isLoading}
        />
      </div>

      {/* Sales Chart */}
      <SalesChart data={data?.chartData || []} isLoading={isLoading} />

      {/* Order Types & Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <OrderTypeCard data={data?.orderTypes || []} isLoading={isLoading} />
        <PaymentMethodCard data={data?.paymentMethods || []} isLoading={isLoading} />
      </div>

      {/* Active Orders & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <ActiveOrdersCard
          data={data?.activeOrders || { count: 0, items: [] }}
          isLoading={isLoading}
        />
        <RecentTransactionsCard
          data={data?.recentTransactions || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
