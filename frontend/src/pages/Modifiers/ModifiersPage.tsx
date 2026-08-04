import { useState, useMemo, useEffect } from 'react';
import { Pencil, Trash2, RefreshCw, Eye, CircleDot } from 'lucide-react';
import { MasterPage } from '../../components/master/MasterPage';
import { MasterTable } from '../../components/master/MasterTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { ModifierModal } from './ModifierModal';
import { ModifierDetailDrawer } from './ModifierDetailDrawer';
import {
  useModifiers,
  useDeleteModifier,
} from '../../hooks/useModifiers';
import { useActiveModifierGroups } from '../../hooks/useModifierGroups';
import { useHasPermission } from '../../hooks/usePermission';
import type { Modifier } from '../../api/modifier.api';
import type { ModifierGroup } from '../../api/modifier-group.api';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function ModifiersPage() {
  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modifierGroupFilter, setModifierGroupFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');
  const [sort, setSort] = useState<'name' | 'sortOrder' | 'additionalPrice' | 'createdAt' | 'updatedAt'>('sortOrder');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModifier, setEditingModifier] = useState<Modifier | null>(null);
  const [viewingModifier, setViewingModifier] = useState<Modifier | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Get modifier groups for filter dropdown
  const { data: modifierGroupsData } = useActiveModifierGroups();
  const modifierGroups = modifierGroupsData || [];

  // API params
  const params = useMemo(() => ({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    modifierGroupId: modifierGroupFilter || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    sort,
    order,
  }), [page, debouncedSearch, modifierGroupFilter, statusFilter, sort, order]);

  // Queries
  const { data, isLoading, isFetching, refetch, error } = useModifiers(params);
  const deleteModifier = useDeleteModifier();

  // Permissions
  const canCreate = useHasPermission('create_modifier');
  const canUpdate = useHasPermission('update_modifier');
  const canDelete = useHasPermission('delete_modifier');

  // Handlers
  const handleCreate = () => {
    setEditingModifier(null);
    setIsModalOpen(true);
  };

  const handleEdit = (modifier: Modifier) => {
    setEditingModifier(modifier);
    setIsModalOpen(true);
  };

  const handleView = (modifier: Modifier) => {
    setViewingModifier(modifier);
  };

  const handleDelete = async (modifier: Modifier) => {
    if (window.confirm(`Are you sure you want to delete modifier "${modifier.name}"?`)) {
      try {
        await deleteModifier.mutateAsync(modifier.id);
      } catch (error) {
        console.error('Failed to delete modifier:', error);
      }
    }
  };

  // Get modifier group name by ID
  const getModifierGroupName = (groupId: string) => {
    const group = modifierGroups.find((g: ModifierGroup) => g.id === groupId);
    return group?.name || '-';
  };

  // Columns
  const columns = [
    {
      key: 'modifierGroup',
      header: 'Modifier Group',
      render: (m: Modifier) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <CircleDot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{m.modifierGroup?.name || getModifierGroupName(m.modifierGroupId)}</p>
            <p className="text-xs text-slate-500 font-mono">{m.modifierGroup?.slug || 'N/A'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Modifier',
      render: (m: Modifier) => (
        <div>
          <p className="font-medium text-slate-900">{m.name}</p>
          {m.sku && <p className="text-xs text-slate-500 font-mono">{m.sku}</p>}
        </div>
      ),
    },
    {
      key: 'additionalPrice',
      header: 'Additional Price',
      render: (m: Modifier) => (
        <span className={`font-medium ${m.additionalPrice > 0 ? 'text-indigo-600' : 'text-slate-500'}`}>
          {m.additionalPrice > 0 ? `+${formatCurrency(m.additionalPrice)}` : 'Free'}
        </span>
      ),
    },
    {
      key: 'sortOrder',
      header: 'Sort',
      render: (m: Modifier) => (
        <span className="text-sm text-slate-500">{m.sortOrder}</span>
      ),
    },
    {
      key: 'flags',
      header: 'Flags',
      render: (m: Modifier) => (
        <div className="flex items-center gap-1 flex-wrap">
          {m.isDefault && (
            <Badge variant="info" size="sm">Default</Badge>
          )}
          {!m.isAvailable && (
            <Badge variant="warning" size="sm">Unavailable</Badge>
          )}
          <Badge variant={m.isActive ? 'success' : 'danger'} size="sm">
            {m.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (m: Modifier) => (
        <span className="text-sm text-slate-500">
          {new Date(m.createdAt).toLocaleDateString('id-ID', {
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
      render: (m: Modifier) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(m);
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
                handleEdit(m);
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
                handleDelete(m);
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
      title="Modifier Management"
      subtitle="Manage modifiers for your products"
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
      createLabel="Add Modifier"
      canCreate={!!canCreate}
    >
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="search"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Select
            options={[
              { value: '', label: 'All Groups' },
              ...modifierGroups.map((g: ModifierGroup) => ({ value: g.id, label: g.name })),
            ]}
            value={modifierGroupFilter}
            onChange={(e) => {
              setModifierGroupFilter(e.target.value);
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
              { value: 'sortOrder:ASC', label: 'Sort Order (Low to High)' },
              { value: 'sortOrder:DESC', label: 'Sort Order (High to Low)' },
              { value: 'name:ASC', label: 'Name A-Z' },
              { value: 'name:DESC', label: 'Name Z-A' },
              { value: 'additionalPrice:ASC', label: 'Price (Low to High)' },
              { value: 'additionalPrice:DESC', label: 'Price (High to Low)' },
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
              Unable to load modifiers
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
            emptyMessage="No modifiers found"
            onRowClick={handleView}
          />

          {/* Pagination */}
          {data && data.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.meta.total)} of {data.meta.total} modifiers
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
      <ModifierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modifier={editingModifier}
      />

      <ModifierDetailDrawer
        isOpen={!!viewingModifier}
        onClose={() => setViewingModifier(null)}
        modifier={viewingModifier}
        onEdit={canUpdate ? handleEdit : undefined}
      />
    </MasterPage>
  );
}
