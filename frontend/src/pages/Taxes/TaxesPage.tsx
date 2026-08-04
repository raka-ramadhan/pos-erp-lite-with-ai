import { useState, useMemo, useEffect } from 'react';
import { RefreshCw, Pencil, Trash2, Eye, DollarSign, Percent } from 'lucide-react';
import { MasterPage } from '../../components/master/MasterPage';
import { MasterTable } from '../../components/master/MasterTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { TaxModal } from './TaxModal';
import { TaxDetailDrawer } from './TaxDetailDrawer';
import {
  useTaxes,
  useDeleteTax,
} from '../../hooks/useTaxes';
import { useHasPermission } from '../../hooks/usePermission';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Tax } from '../../api/tax.api';

export function TaxesPage() {
  useDocumentTitle('Taxes');

  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [taxTypeFilter, setTaxTypeFilter] = useState<'all' | 'percentage' | 'fixed_amount'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');
  const [sort, setSort] = useState<'calculationOrder' | 'name' | 'code' | 'rate' | 'createdAt'>('calculationOrder');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [viewingTax, setViewingTax] = useState<Tax | null>(null);

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
    taxType: taxTypeFilter === 'all' ? undefined : taxTypeFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    sort,
    order,
  }), [page, debouncedSearch, taxTypeFilter, statusFilter, sort, order]);

  // Queries
  const { data, isLoading, isFetching, refetch, error } = useTaxes(params);
  const deleteTax = useDeleteTax();

  // Permissions
  const canCreate = useHasPermission('create_taxes');
  const canUpdate = useHasPermission('update_taxes');
  const canDelete = useHasPermission('delete_taxes');

  // Handlers
  const handleCreate = () => {
    setEditingTax(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tax: Tax) => {
    setEditingTax(tax);
    setIsModalOpen(true);
  };

  const handleView = (tax: Tax) => {
    setViewingTax(tax);
  };

  const handleDelete = async (tax: Tax) => {
    if (window.confirm(`Are you sure you want to delete tax "${tax.name}"?`)) {
      try {
        await deleteTax.mutateAsync(tax.id);
      } catch (error) {
        console.error('Failed to delete tax:', error);
      }
    }
  };

  // Format rate display
  const formatRate = (tax: Tax) => {
    if (tax.taxType === 'percentage') {
      return `${tax.rate}%`;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(tax.rate);
  };

  // Columns
  const columns = [
    {
      key: 'code',
      header: 'Code',
      render: (t: Tax) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            {t.taxType === 'percentage' ? (
              <Percent className="w-5 h-5 text-white" />
            ) : (
              <DollarSign className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <p className="font-medium text-slate-900 font-mono">{t.code}</p>
            <p className="text-xs text-slate-500">{t.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'taxType',
      header: 'Type',
      render: (t: Tax) => (
        <Badge
          variant={t.taxType === 'percentage' ? 'info' : 'secondary'}
          size="sm"
        >
          {t.taxType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
        </Badge>
      ),
    },
    {
      key: 'rate',
      header: 'Rate',
      render: (t: Tax) => (
        <span className="font-medium text-slate-900">
          {formatRate(t)}
        </span>
      ),
    },
    {
      key: 'calculationOrder',
      header: 'Order',
      render: (t: Tax) => (
        <span className="text-sm text-slate-500">{t.calculationOrder}</span>
      ),
    },
    {
      key: 'flags',
      header: 'Flags',
      render: (t: Tax) => (
        <div className="flex items-center gap-1 flex-wrap">
          {t.isDefault && (
            <Badge variant="warning" size="sm">Default</Badge>
          )}
          {t.isInclusive && (
            <Badge variant="secondary" size="sm">Inclusive</Badge>
          )}
          <Badge variant={t.isActive ? 'success' : 'danger'} size="sm">
            {t.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (t: Tax) => (
        <span className="text-sm text-slate-500">
          {new Date(t.createdAt).toLocaleDateString('id-ID', {
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
      render: (t: Tax) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(t);
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
                handleEdit(t);
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
                handleDelete(t);
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
      title="Tax Management"
      subtitle="Configure taxes for your products and orders"
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
      createLabel="Add Tax"
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
              { value: 'percentage', label: 'Percentage' },
              { value: 'fixed_amount', label: 'Fixed Amount' },
            ]}
            value={taxTypeFilter}
            onChange={(e) => {
              setTaxTypeFilter(e.target.value as 'all' | 'percentage' | 'fixed_amount');
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
              { value: 'calculationOrder:ASC', label: 'Order (1, 2, 3...)' },
              { value: 'calculationOrder:DESC', label: 'Order (3, 2, 1...)' },
              { value: 'name:ASC', label: 'Name A-Z' },
              { value: 'name:DESC', label: 'Name Z-A' },
              { value: 'rate:ASC', label: 'Rate (Low to High)' },
              { value: 'rate:DESC', label: 'Rate (High to Low)' },
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
              Unable to load taxes
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
            emptyMessage="No taxes found"
            onRowClick={handleView}
          />

          {/* Pagination */}
          {data && data.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.meta.total)} of {data.meta.total} taxes
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
      <TaxModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tax={editingTax}
      />

      <TaxDetailDrawer
        isOpen={!!viewingTax}
        onClose={() => setViewingTax(null)}
        tax={viewingTax}
        onEdit={canUpdate ? handleEdit : undefined}
      />
    </MasterPage>
  );
}
