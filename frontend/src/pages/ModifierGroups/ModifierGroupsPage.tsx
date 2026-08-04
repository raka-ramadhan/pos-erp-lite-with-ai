import { useState, useMemo, useEffect } from 'react';
import { Pencil, Trash2, RefreshCw, Eye, Layers } from 'lucide-react';
import { MasterPage } from '../../components/master/MasterPage';
import { MasterTable } from '../../components/master/MasterTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { ModifierGroupModal } from './ModifierGroupModal';
import { ModifierGroupDetailDrawer } from './ModifierGroupDetailDrawer';
import {
  useModifierGroups,
  useDeleteModifierGroup,
} from '../../hooks/useModifierGroups';
import { useHasPermission } from '../../hooks/usePermission';
import type { ModifierGroup } from '../../api/modifier-group.api';

export function ModifierGroupsPage() {
  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectionTypeFilter, setSelectionTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');
  const [sort, setSort] = useState<'name' | 'sortOrder' | 'createdAt' | 'updatedAt'>('sortOrder');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModifierGroup, setEditingModifierGroup] = useState<ModifierGroup | null>(null);
  const [viewingModifierGroup, setViewingModifierGroup] = useState<ModifierGroup | null>(null);

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
    sort,
    order,
    selectionType: (selectionTypeFilter || undefined) as 'single' | 'multiple' | undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  }), [page, debouncedSearch, sort, order, statusFilter, selectionTypeFilter]);

  // Queries
  const { data, isLoading, isFetching, refetch, error } = useModifierGroups(params);
  const deleteModifierGroup = useDeleteModifierGroup();

  // Permissions
  const canCreate = useHasPermission('create_modifiergroups');
  const canUpdate = useHasPermission('update_modifiergroups');
  const canDelete = useHasPermission('delete_modifiergroups');

  // Handlers
  const handleCreate = () => {
    setEditingModifierGroup(null);
    setIsModalOpen(true);
  };

  const handleEdit = (modifierGroup: ModifierGroup) => {
    setEditingModifierGroup(modifierGroup);
    setIsModalOpen(true);
  };

  const handleView = (modifierGroup: ModifierGroup) => {
    setViewingModifierGroup(modifierGroup);
  };

  const handleDelete = async (modifierGroup: ModifierGroup) => {
    if (window.confirm(`Are you sure you want to delete modifier group "${modifierGroup.name}"?`)) {
      try {
        await deleteModifierGroup.mutateAsync(modifierGroup.id);
      } catch (error) {
        console.error('Failed to delete modifier group:', error);
      }
    }
  };

  // Columns
  const columns = [
    {
      key: 'name',
      header: 'Modifier Group',
      render: (mg: ModifierGroup) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{mg.name}</p>
            <p className="text-xs text-slate-500 font-mono">{mg.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'selectionType',
      header: 'Selection Type',
      render: (mg: ModifierGroup) => (
        <Badge
          variant={mg.selectionType === 'single' ? 'info' : 'warning'}
          size="sm"
        >
          {mg.selectionType === 'single' ? 'Single Choice' : 'Multiple Choice'}
        </Badge>
      ),
    },
    {
      key: 'rules',
      header: 'Rules',
      render: (mg: ModifierGroup) => (
        <div className="text-sm text-slate-600">
          {mg.selectionType === 'single' ? (
            <span className="flex items-center gap-1">
              Pick <strong>1</strong>
              {mg.isRequired && (
                <Badge variant="danger" size="sm">Required</Badge>
              )}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              Pick <strong>{mg.minSelections ?? 0} - {mg.maxSelections ?? 1}</strong>
              {mg.isRequired && (
                <Badge variant="danger" size="sm">Required</Badge>
              )}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'modifierCount',
      header: 'Modifiers',
      render: (mg: ModifierGroup) => (
        <span className="text-sm text-slate-600">
          {mg.modifierCount ?? mg.modifiers?.length ?? 0} items
        </span>
      ),
    },
    {
      key: 'sortOrder',
      header: 'Sort',
      render: (mg: ModifierGroup) => (
        <span className="text-sm text-slate-500">{mg.sortOrder}</span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (mg: ModifierGroup) => (
        <Badge variant={mg.isActive ? 'success' : 'danger'} size="sm">
          {mg.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-32',
      render: (mg: ModifierGroup) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(mg);
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
                handleEdit(mg);
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
                handleDelete(mg);
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
      title="Modifier Group Management"
      subtitle="Define options and customizations for your products"
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
      createLabel="Add Modifier Group"
      canCreate={!!canCreate}
    >
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="search"
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Select
            options={[
              { value: '', label: 'All Types' },
              { value: 'single', label: 'Single Choice' },
              { value: 'multiple', label: 'Multiple Choice' },
            ]}
            value={selectionTypeFilter}
            onChange={(e) => {
              setSelectionTypeFilter(e.target.value);
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
              Unable to load modifier groups
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
            emptyMessage="No modifier groups found"
            onRowClick={handleView}
          />

          {/* Pagination */}
          {data && data.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.meta.total)} of {data.meta.total} modifier groups
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
      <ModifierGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modifierGroup={editingModifierGroup}
      />

      <ModifierGroupDetailDrawer
        isOpen={!!viewingModifierGroup}
        onClose={() => setViewingModifierGroup(null)}
        modifierGroup={viewingModifierGroup}
        onEdit={canUpdate ? handleEdit : undefined}
      />
    </MasterPage>
  );
}
