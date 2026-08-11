import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Search, AlertCircle } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import { Button } from '../../components/ui';
import { Spinner } from '../../components/ui';
import { Badge } from '../../components/ui';
import { Card, CardBody } from '../../components/ui';
import { getTransactionDetailRoute } from '../../routes/constants';

type DateFilter = 'today' | 'yesterday' | 'this_week' | 'this_month';

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: 'today', label: 'Hari Ini' },
  { key: 'yesterday', label: 'Kemarin' },
  { key: 'this_week', label: 'Minggu Ini' },
  { key: 'this_month', label: 'Bulan Ini' },
];

function getDateRange(filter: DateFilter): { dateFrom: string; dateTo: string } {
  const now = new Date();
  switch (filter) {
    case 'today':
      return {
        dateFrom: format(startOfDay(now), 'yyyy-MM-dd'),
        dateTo: format(endOfDay(now), 'yyyy-MM-dd'),
      };
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return {
        dateFrom: format(startOfDay(yesterday), 'yyyy-MM-dd'),
        dateTo: format(endOfDay(yesterday), 'yyyy-MM-dd'),
      };
    case 'this_week':
      return {
        dateFrom: format(startOfWeek(now, { locale: id }), 'yyyy-MM-dd'),
        dateTo: format(endOfWeek(now, { locale: id }), 'yyyy-MM-dd'),
      };
    case 'this_month':
      return {
        dateFrom: format(startOfMonth(now), 'yyyy-MM-dd'),
        dateTo: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return format(date, "dd MMM yyyy • HH:mm", { locale: id });
}

function getOrderTypeBadge(orderType: string): { variant: 'success' | 'warning' | 'info' | 'default'; label: string } {
  switch (orderType) {
    case 'dine_in':
      return { variant: 'success', label: 'Dine In' };
    case 'take_away':
      return { variant: 'warning', label: 'Take Away' };
    case 'delivery':
      return { variant: 'info', label: 'Delivery' };
    default:
      return { variant: 'default', label: orderType };
  }
}

function getPaymentBadge(paymentMethod?: string | null): { variant: 'success' | 'warning' | 'info' | 'default'; label: string } {
  if (!paymentMethod) {
    return { variant: 'default', label: '-' };
  }
  const method = paymentMethod.toLowerCase();
  if (method.includes('cash')) {
    return { variant: 'success', label: 'Tunai' };
  }
  if (method.includes('debit') || method.includes('credit') || method.includes('card')) {
    return { variant: 'info', label: 'Card' };
  }
  if (method.includes('qr') || method.includes('qris')) {
    return { variant: 'warning', label: 'QRIS' };
  }
  return { variant: 'default', label: paymentMethod };
}

export function HistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search change
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Get date range from filter
  const dateRange = useMemo(() => getDateRange(dateFilter), [dateFilter]);

  // Fetch transactions
  const { data, isLoading, isError, error, refetch } = useTransactions({
    page,
    limit,
    search: debouncedSearch || undefined,
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
  });

  // Handle date filter change
  const handleDateFilterChange = useCallback((filter: DateFilter) => {
    setDateFilter(filter);
    setPage(1); // Reset to first page on filter change
  }, []);

  // Handle row click
  const handleRowClick = useCallback((transactionId: string) => {
    navigate(getTransactionDetailRoute(transactionId));
  }, [navigate]);

  // Pagination handlers
  const canGoPrevious = page > 1;
  const canGoNext = data?.meta ? page < data.meta.totalPages : false;

  const handlePrevious = () => {
    if (canGoPrevious) setPage(p => p - 1);
  };

  const handleNext = () => {
    if (canGoNext) setPage(p => p + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/pos')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-slate-900">Riwayat Transaksi</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor transaksi atau order..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Date Filters */}
        <div className="px-4 pb-4 flex gap-2 overflow-x-auto">
          {DATE_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleDateFilterChange(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                dateFilter === key
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" className="text-indigo-600 mb-4" />
            <p className="text-slate-500">Memuat riwayat...</p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">Gagal memuat riwayat transaksi</p>
            </div>
            <p className="text-slate-500 text-sm mb-4">
              {error instanceof Error ? error.message : 'Terjadi kesalahan'}
            </p>
            <Button onClick={() => refetch()} variant="primary" size="sm">
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && data?.data && data.data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">Belum ada transaksi</p>
            <p className="text-slate-400 text-sm mt-1">
              Transaksi pada periode ini akan muncul di sini
            </p>
          </div>
        )}

        {/* Transaction List */}
        {!isLoading && !isError && data?.data && data.data.length > 0 && (
          <div className="space-y-3">
            {data.data.map((transaction) => {
              const orderTypeBadge = getOrderTypeBadge(transaction.orderType);
              const paymentBadge = getPaymentBadge(transaction.paymentMethod);

              return (
                <Card
                  key={transaction.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleRowClick(transaction.id)}
                >
                  <CardBody className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-slate-900">
                          {transaction.transactionNumber}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDateTime(transaction.completedAt)}
                        </p>
                      </div>
                      <p className="font-semibold text-indigo-600">
                        {formatCurrency(transaction.totalAmount)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={orderTypeBadge.variant}>
                        {orderTypeBadge.label}
                      </Badge>
                      {transaction.orderType === 'dine_in' && transaction.tableName && (
                        <Badge variant="default">Meja {transaction.tableName}</Badge>
                      )}
                      <Badge variant={paymentBadge.variant}>
                        {paymentBadge.label}
                      </Badge>
                    </div>
                  </CardBody>
                </Card>
              );
            })}

            {/* Pagination */}
            {data?.meta && data.meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 pb-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={!canGoPrevious}
                >
                  Sebelumnya
                </Button>
                <span className="text-sm text-slate-600">
                  {page} / {data.meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={!canGoNext}
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;
