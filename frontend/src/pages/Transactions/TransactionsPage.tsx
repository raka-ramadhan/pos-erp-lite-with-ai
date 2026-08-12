import { useState, useMemo, useEffect } from 'react';
import { RefreshCw, FileText, Search, Calendar, Filter } from 'lucide-react';
import { MasterPage } from '../../components/master/MasterPage';
import { MasterTable } from '../../components/master/MasterTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { TransactionDetailDrawer } from './TransactionDetailDrawer';
import { useTransactions } from '../../hooks/useTransactions';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useHasPermission } from '../../hooks/usePermission';
import type { TransactionSummary, OrderType } from '../../api/transactions.api';

// Helper function
function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date
function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TransactionsPage() {
  useDocumentTitle('Transactions');

  // Permissions
  const canView = useHasPermission('view_transactions');

  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderType | ''>('');
  const [viewingTransaction, setViewingTransaction] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // API params
  const params = useMemo(() => ({
    page,
    limit: 15,
    search: debouncedSearch || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    orderType: orderTypeFilter || undefined,
  }), [page, debouncedSearch, dateFrom, dateTo, orderTypeFilter]);

  // Query
  const { data, isLoading, isFetching, refetch, error } = useTransactions(params);

  // Order type badge variant
  const getOrderTypeBadge = (type: OrderType) => {
    switch (type) {
      case 'dine_in':
        return { variant: 'info' as const, label: 'Dine In' };
      case 'take_away':
        return { variant: 'secondary' as const, label: 'Take Away' };
      case 'delivery':
        return { variant: 'warning' as const, label: 'Delivery' };
      default:
        return { variant: 'default' as const, label: type };
    }
  };

  // Payment status badge
  const getPaymentStatusBadge = (status: 'paid' | 'unpaid') => {
    return status === 'paid'
      ? { variant: 'success' as const, label: 'Paid' }
      : { variant: 'warning' as const, label: 'Unpaid' };
  };

  // Columns
  const columns = [
    {
      key: 'transactionNumber',
      header: 'Transaction',
      render: (t: TransactionSummary) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-900 font-mono">{t.transactionNumber}</p>
            <p className="text-xs text-slate-500">
              {t.itemCount} item{t.itemCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'orderType',
      header: 'Type',
      render: (t: TransactionSummary) => {
        const badge = getOrderTypeBadge(t.orderType);
        return <Badge variant={badge.variant} size="sm">{badge.label}</Badge>;
      },
    },
    {
      key: 'table',
      header: 'Table',
      render: (t: TransactionSummary) => (
        <span className="text-sm text-slate-600">
          {t.tableName ? `${t.tableName}${t.tableCode ? ` (${t.tableCode})` : ''}` : '-'}
        </span>
      ),
    },
    {
      key: 'cashier',
      header: 'Cashier',
      render: (t: TransactionSummary) => (
        <span className="text-sm text-slate-600">
          {t.cashierName || '-'}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (t: TransactionSummary) => (
        <span className="font-semibold text-slate-900">
          {formatCurrency(t.totalAmount)}
        </span>
      ),
    },
    {
      key: 'completedAt',
      header: 'Date',
      render: (t: TransactionSummary) => (
        <span className="text-sm text-slate-500">
          {formatDate(t.completedAt || t.orderedAt)}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Status',
      render: (t: TransactionSummary) => {
        const badge = getPaymentStatusBadge(t.paymentStatus);
        return <Badge variant={badge.variant} size="sm">{badge.label}</Badge>;
      },
    },
  ];

  return (
    <MasterPage
      title="Transactions"
      subtitle="View and manage transaction history"
      actions={
        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />}
        >
          Refresh
        </Button>
      }
    >
      {/* Permission check */}
      {!canView ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <span className="text-amber-600 text-xl">🔒</span>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Access Denied
            </h3>
            <p className="text-sm text-slate-500">
              You don't have permission to view transactions.
              Please contact your administrator.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search by transaction or order number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Date From */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Date To */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Order Type */}
              <div>
                <select
                  value={orderTypeFilter}
                  onChange={(e) => {
                    setOrderTypeFilter(e.target.value as OrderType | '');
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Types</option>
                  <option value="dine_in">Dine In</option>
                  <option value="take_away">Take Away</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
            </div>

            {/* Clear filters */}
            {(search || dateFrom || dateTo || orderTypeFilter) && (
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500">Active filters:</span>
                {search && (
                  <Badge variant="default" size="sm">
                    Search: {search}
                  </Badge>
                )}
                {dateFrom && (
                  <Badge variant="default" size="sm">
                    From: {dateFrom}
                  </Badge>
                )}
                {dateTo && (
                  <Badge variant="default" size="sm">
                    To: {dateTo}
                  </Badge>
                )}
                {orderTypeFilter && (
                  <Badge variant="default" size="sm">
                    Type: {orderTypeFilter}
                  </Badge>
                )}
                <button
                  onClick={() => {
                    setSearch('');
                    setDebouncedSearch('');
                    setDateFrom('');
                    setDateTo('');
                    setOrderTypeFilter('');
                    setPage(1);
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Unable to load transactions
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  {error.message || 'An error occurred while fetching transactions'}
                </p>
                <Button variant="secondary" size="sm" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <>
              <MasterTable
                columns={columns}
                data={data?.data || []}
                keyField="id"
                emptyMessage="No transactions found"
                onRowClick={(t) => setViewingTransaction(t.id)}
              />

              {/* Pagination */}
              {data && data.meta && data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-slate-500">
                    Showing {((page - 1) * 15) + 1} to {Math.min(page * 15, data.meta.total)} of {data.meta.total} transactions
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-slate-600 px-2">
                      Page {page} of {data.meta.totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page >= data.meta.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Detail Drawer */}
      <TransactionDetailDrawer
        transactionId={viewingTransaction}
        onClose={() => setViewingTransaction(null)}
      />
    </MasterPage>
  );
}
