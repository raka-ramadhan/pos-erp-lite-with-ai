import { useState, useMemo, useEffect } from 'react';
import { RefreshCw, Pencil, Trash2, Eye, CreditCard, Smartphone, Building2, Wallet, QrCode, List } from 'lucide-react';
import { MasterPage } from '../../components/master/MasterPage';
import { MasterTable } from '../../components/master/MasterTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { PaymentMethodModal } from './PaymentMethodModal';
import { PaymentMethodDetailDrawer } from './PaymentMethodDetailDrawer';
import {
  usePaymentMethods,
  useDeletePaymentMethod,
} from '../../hooks/usePaymentMethods';
import { useHasPermission } from '../../hooks/usePermission';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { PaymentMethod, PaymentType } from '../../api/payment-method.api';
import { PAYMENT_TYPE_OPTIONS } from '../../api/payment-method.api';

const PAYMENT_TYPE_ICONS: Record<PaymentType, React.ReactNode> = {
  cash: <Wallet className="w-5 h-5 text-white" />,
  e_wallet: <Smartphone className="w-5 h-5 text-white" />,
  bank_transfer: <Building2 className="w-5 h-5 text-white" />,
  card: <CreditCard className="w-5 h-5 text-white" />,
  qris: <QrCode className="w-5 h-5 text-white" />,
  other: <List className="w-5 h-5 text-white" />,
};

const PAYMENT_TYPE_GRADIENTS: Record<PaymentType, string> = {
  cash: 'from-green-500 to-emerald-500',
  e_wallet: 'from-blue-500 to-indigo-500',
  bank_transfer: 'from-purple-500 to-violet-500',
  card: 'from-orange-500 to-amber-500',
  qris: 'from-pink-500 to-rose-500',
  other: 'from-slate-500 to-gray-500',
};

export function PaymentMethodsPage() {
  useDocumentTitle('Payment Methods');

  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<'all' | PaymentType>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');
  const [sort, setSort] = useState<'sortOrder' | 'name' | 'code' | 'paymentType' | 'createdAt'>('sortOrder');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [viewingPaymentMethod, setViewingPaymentMethod] = useState<PaymentMethod | null>(null);

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
    limit: 10,
    search: debouncedSearch || undefined,
    paymentType: paymentTypeFilter === 'all' ? undefined : paymentTypeFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    sort,
    order,
  }), [page, debouncedSearch, paymentTypeFilter, statusFilter, sort, order]);

  // Queries
  const { data, isLoading, isFetching, refetch, error } = usePaymentMethods(params);
  const deletePaymentMethod = useDeletePaymentMethod();

  // Permissions
  const canCreate = useHasPermission('create_paymentmethods');
  const canUpdate = useHasPermission('update_paymentmethods');
  const canDelete = useHasPermission('delete_paymentmethods');

  // Handlers
  const handleCreate = () => {
    setEditingPaymentMethod(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pm: PaymentMethod) => {
    setEditingPaymentMethod(pm);
    setIsModalOpen(true);
  };

  const handleView = (pm: PaymentMethod) => {
    setViewingPaymentMethod(pm);
  };

  const handleDelete = async (pm: PaymentMethod) => {
    if (window.confirm(`Are you sure you want to delete payment method "${pm.name}"?`)) {
      try {
        await deletePaymentMethod.mutateAsync(pm.id);
      } catch (error) {
        console.error('Failed to delete payment method:', error);
      }
    }
  };

  // Format amount display
  const formatAmount = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get payment type badge variant
  const getPaymentTypeVariant = (type: PaymentType) => {
    const variants: Record<PaymentType, 'info' | 'secondary' | 'warning' | 'success' | 'danger'> = {
      cash: 'success',
      e_wallet: 'info',
      bank_transfer: 'secondary',
      card: 'warning',
      qris: 'info',
      other: 'secondary',
    };
    return variants[type];
  };

  // Columns
  const columns = [
    {
      key: 'code',
      header: 'Payment Method',
      render: (pm: PaymentMethod) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${PAYMENT_TYPE_GRADIENTS[pm.paymentType]} flex items-center justify-center`}>
            {PAYMENT_TYPE_ICONS[pm.paymentType]}
          </div>
          <div>
            <p className="font-medium text-slate-900 font-mono">{pm.code}</p>
            <p className="text-xs text-slate-500">{pm.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'paymentType',
      header: 'Type',
      render: (pm: PaymentMethod) => (
        <Badge
          variant={getPaymentTypeVariant(pm.paymentType)}
          size="sm"
        >
          {PAYMENT_TYPE_OPTIONS[pm.paymentType]?.label || pm.paymentType}
        </Badge>
      ),
    },
    {
      key: 'provider',
      header: 'Provider',
      render: (pm: PaymentMethod) => (
        <span className="text-sm text-slate-600">
          {pm.provider || '-'}
        </span>
      ),
    },
    {
      key: 'integration',
      header: 'Integration',
      render: (pm: PaymentMethod) => (
        pm.isIntegration ? (
          <Badge variant="info" size="sm">External</Badge>
        ) : (
          <span className="text-xs text-slate-400">Built-in</span>
        )
      ),
    },
    {
      key: 'limits',
      header: 'Limits',
      render: (pm: PaymentMethod) => (
        <span className="text-sm text-slate-500">
          {pm.minAmount || pm.maxAmount ? (
            <>
              {pm.minAmount ? formatAmount(pm.minAmount) : 'Rp 0'} - {pm.maxAmount ? formatAmount(pm.maxAmount) : '∞'}
            </>
          ) : '-'}
        </span>
      ),
    },
    {
      key: 'flags',
      header: 'Status',
      render: (pm: PaymentMethod) => (
        <Badge variant={pm.isActive ? 'success' : 'danger'} size="sm">
          {pm.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (pm: PaymentMethod) => (
        <span className="text-sm text-slate-500">
          {new Date(pm.createdAt).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-32',
      render: (pm: PaymentMethod) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(pm);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canUpdate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(pm);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(pm);
              }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <MasterPage
      title="Payment Methods"
      subtitle="Configure payment options for your restaurant"
      actions={
        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      }
      onCreate={canCreate ? handleCreate : undefined}
      createLabel="Add Payment Method"
      canCreate={!!canCreate}
    >
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="search"
            placeholder="Search by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Select
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'cash', label: '💵 Cash' },
              { value: 'e_wallet', label: '📱 E-Wallet' },
              { value: 'bank_transfer', label: '🏦 Bank Transfer' },
              { value: 'card', label: '💳 Card' },
              { value: 'qris', label: '📲 QRIS' },
              { value: 'other', label: '📋 Other' },
            ]}
            value={paymentTypeFilter}
            onChange={(e) => {
              setPaymentTypeFilter(e.target.value as 'all' | PaymentType);
              setPage(1);
            }}
          />
          <Select
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'active' | 'inactive' | 'all');
              setPage(1);
            }}
          />
          <Select
            options={[
              { value: 'sortOrder:ASC', label: 'Sort Order (1, 2, 3...)' },
              { value: 'sortOrder:DESC', label: 'Sort Order (3, 2, 1...)' },
              { value: 'name:ASC', label: 'Name A-Z' },
              { value: 'name:DESC', label: 'Name Z-A' },
              { value: 'code:ASC', label: 'Code A-Z' },
              { value: 'code:DESC', label: 'Code Z-A' },
              { value: 'createdAt:DESC', label: 'Newest First' },
              { value: 'createdAt:ASC', label: 'Oldest First' },
            ]}
            value={`${sort}:${order}`}
            onChange={(e) => {
              const [s, o] = e.target.value.split(':');
              setSort(s as typeof sort);
              setOrder(o as 'ASC' | 'DESC');
              setPage(1);
            }}
          />
        </div>
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
              Unable to load payment methods
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {error.message || 'You may not have permission to access this resource'}
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
            emptyMessage="No payment methods found"
            onRowClick={handleView}
          />

          {/* Pagination */}
          {data && data.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.meta.total)} of {data.meta.total} payment methods
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
                <span className="text-sm text-slate-600">
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

      {/* Modals */}
      <PaymentMethodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        paymentMethod={editingPaymentMethod}
      />

      <PaymentMethodDetailDrawer
        isOpen={!!viewingPaymentMethod}
        onClose={() => setViewingPaymentMethod(null)}
        paymentMethod={viewingPaymentMethod}
        onEdit={canUpdate ? handleEdit : undefined}
      />
    </MasterPage>
  );
}
