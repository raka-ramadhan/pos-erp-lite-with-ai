import { useState, useMemo, useEffect } from 'react';
import { RefreshCw, Pencil, Trash2, Eye, Percent, Banknote, Calendar, Hash } from 'lucide-react';
import { MasterPage } from '../../components/master/MasterPage';
import { MasterTable } from '../../components/master/MasterTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { DiscountModal } from './DiscountModal';
import { DiscountDetailDrawer } from './DiscountDetailDrawer';
import {
  useDiscounts,
  useDeleteDiscount,
} from '../../hooks/useDiscounts';
import { useHasPermission } from '../../hooks/usePermission';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Discount, DiscountType } from '../../api/discount.api';
import { DISCOUNT_TYPE_OPTIONS } from '../../api/discount.api';

const DISCOUNT_TYPE_GRADIENTS: Record<DiscountType, string> = {
  percentage: 'from-blue-500 to-indigo-500',
  fixed_amount: 'from-green-500 to-emerald-500',
};

export function DiscountsPage() {
  useDocumentTitle('Discounts');

  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [discountTypeFilter, setDiscountTypeFilter] = useState<'all' | DiscountType>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');
  const [sort, setSort] = useState<'sortOrder' | 'name' | 'code' | 'value' | 'createdAt'>('sortOrder');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [viewingDiscount, setViewingDiscount] = useState<Discount | null>(null);

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
    discountType: discountTypeFilter === 'all' ? undefined : discountTypeFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    sort,
    order,
  }), [page, debouncedSearch, discountTypeFilter, statusFilter, sort, order]);

  // Queries
  const { data, isLoading, isFetching, refetch, error } = useDiscounts(params);
  const deleteDiscount = useDeleteDiscount();

  // Permissions
  const canCreate = useHasPermission('create_discounts');
  const canUpdate = useHasPermission('update_discounts');
  const canDelete = useHasPermission('delete_discounts');

  // Handlers
  const handleCreate = () => {
    setEditingDiscount(null);
    setIsModalOpen(true);
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setIsModalOpen(true);
  };

  const handleView = (discount: Discount) => {
    setViewingDiscount(discount);
  };

  const handleDelete = async (discount: Discount) => {
    if (window.confirm(`Are you sure you want to delete discount "${discount.name}"?`)) {
      try {
        await deleteDiscount.mutateAsync(discount.id);
      } catch (error) {
        console.error('Failed to delete discount:', error);
      }
    }
  };

  // Format value display
  const formatValue = (discount: Discount) => {
    if (discount.discountType === 'percentage') {
      return `${discount.value}%`;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(discount.value);
  };

  // Format period
  const formatPeriod = (discount: Discount) => {
    if (!discount.startDate && !discount.endDate) {
      return <span className="text-xs text-slate-400">No period</span>;
    }
    const start = discount.startDate
      ? new Date(discount.startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
      : '∞';
    const end = discount.endDate
      ? new Date(discount.endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
      : '∞';
    return (
      <span className="text-xs text-slate-600">
        {start} - {end}
      </span>
    );
  };

  // Check if period is active
  const isPeriodActive = (discount: Discount) => {
    if (!discount.startDate && !discount.endDate) return null;
    const now = new Date();
    const start = discount.startDate ? new Date(discount.startDate) : null;
    const end = discount.endDate ? new Date(discount.endDate) : null;

    if (start && now < start) return 'future';
    if (end && now > end) return 'expired';
    if (start && end && now >= start && now <= end) return 'active';
    return null;
  };

  // Get period badge
  const getPeriodBadge = (discount: Discount) => {
    const status = isPeriodActive(discount);
    if (!status) return null;
    if (status === 'future') return <Badge variant="info" size="sm">Scheduled</Badge>;
    if (status === 'expired') return <Badge variant="secondary" size="sm">Expired</Badge>;
    return <Badge variant="success" size="sm">Ongoing</Badge>;
  };

  // Get discount type badge variant
  const getDiscountTypeVariant = (type: DiscountType) => {
    const variants: Record<DiscountType, 'info' | 'success'> = {
      percentage: 'info',
      fixed_amount: 'success',
    };
    return variants[type];
  };

  // Columns
  const columns = [
    {
      key: 'name',
      header: 'Discount',
      render: (discount: Discount) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${DISCOUNT_TYPE_GRADIENTS[discount.discountType]} flex items-center justify-center`}>
            {discount.discountType === 'percentage' ? (
              <Percent className="w-5 h-5 text-white" />
            ) : (
              <Banknote className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <p className="font-medium text-slate-900">{discount.name}</p>
            {discount.code && (
              <p className="text-xs text-slate-500 font-mono">{discount.code}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'discountType',
      header: 'Type',
      render: (discount: Discount) => (
        <Badge variant={getDiscountTypeVariant(discount.discountType)} size="sm">
          {DISCOUNT_TYPE_OPTIONS[discount.discountType]?.label || discount.discountType}
        </Badge>
      ),
    },
    {
      key: 'value',
      header: 'Value',
      render: (discount: Discount) => (
        <span className="font-semibold text-slate-900">
          {formatValue(discount)}
        </span>
      ),
    },
    {
      key: 'period',
      header: 'Period',
      render: (discount: Discount) => (
        <div className="flex flex-col gap-1">
          {formatPeriod(discount)}
          {getPeriodBadge(discount)}
        </div>
      ),
    },
    {
      key: 'flags',
      header: 'Status',
      render: (discount: Discount) => (
        <Badge variant={discount.isActive ? 'success' : 'danger'} size="sm">
          {discount.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (discount: Discount) => (
        <span className="text-sm text-slate-500">
          {new Date(discount.createdAt).toLocaleDateString('id-ID', {
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
      render: (discount: Discount) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(discount);
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
                handleEdit(discount);
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
                handleDelete(discount);
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
      title="Discounts"
      subtitle="Configure discount offers for your restaurant"
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
      createLabel="Add Discount"
      canCreate={!!canCreate}
    >
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="search"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Select
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'percentage', label: '📊 Percentage' },
              { value: 'fixed_amount', label: '💰 Fixed Amount' },
            ]}
            value={discountTypeFilter}
            onChange={(e) => {
              setDiscountTypeFilter(e.target.value as 'all' | DiscountType);
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
              { value: 'value:ASC', label: 'Value (Low to High)' },
              { value: 'value:DESC', label: 'Value (High to Low)' },
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
              Unable to load discounts
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
            emptyMessage="No discounts found"
            onRowClick={handleView}
          />

          {/* Pagination */}
          {data && data.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.meta.total)} of {data.meta.total} discounts
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
      <DiscountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        discount={editingDiscount}
      />

      <DiscountDetailDrawer
        isOpen={!!viewingDiscount}
        onClose={() => setViewingDiscount(null)}
        discount={viewingDiscount}
        onEdit={canUpdate ? handleEdit : undefined}
      />
    </MasterPage>
  );
}
