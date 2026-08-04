import { useState, useMemo, useEffect } from 'react';
import { Pencil, Trash2, RefreshCw, Eye, Folder } from 'lucide-react';
import { MasterPage } from '../../components/master/MasterPage';
import { MasterTable } from '../../components/master/MasterTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { CategoryModal } from './CategoryModal';
import { CategoryDetailDrawer } from './CategoryDetailDrawer';
import {
  useCategories,
  useDeleteCategory,
  useActiveCategories,
} from '../../hooks/useCategories';
import { useHasPermission } from '../../hooks/usePermission';
import type { CategoryResponse } from '../../api/category.api';

export function CategoriesPage() {
  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [parentFilter, setParentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');
  const [sort, setSort] = useState<'name' | 'slug' | 'sortOrder' | 'createdAt' | 'updatedAt'>('createdAt');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [viewingCategory, setViewingCategory] = useState<CategoryResponse | null>(null);

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
    parentId: parentFilter || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  }), [page, debouncedSearch, sort, order, statusFilter, parentFilter]);

  // Queries
  const { data, isLoading, isFetching, refetch, error } = useCategories(params);
  const deleteCategory = useDeleteCategory();
  const { data: allCategories } = useActiveCategories();

  // Permissions
  const canCreate = useHasPermission('create_categories');
  const canUpdate = useHasPermission('update_categories');
  const canDelete = useHasPermission('delete_categories');

  // Handlers
  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: CategoryResponse) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleView = (category: CategoryResponse) => {
    setViewingCategory(category);
  };

  const handleDelete = async (category: CategoryResponse) => {
    if (window.confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      try {
        await deleteCategory.mutateAsync(category.id);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  // Columns
  const columns = [
    {
      key: 'name',
      header: 'Category',
      render: (category: CategoryResponse) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            {category.imageUrl ? (
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <Folder className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <p className="font-medium text-slate-900">{category.name}</p>
            <p className="text-xs text-slate-500 font-mono">{category.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'parent',
      header: 'Parent',
      render: (category: CategoryResponse) => (
        <span className="text-sm text-slate-600">
          {category.parent?.name || '-'}
        </span>
      ),
    },
    {
      key: 'sortOrder',
      header: 'Sort',
      render: (category: CategoryResponse) => (
        <span className="text-sm text-slate-500">{category.sortOrder}</span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (category: CategoryResponse) => (
        <Badge variant={category.isActive ? 'success' : 'danger'} size="sm">
          {category.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (cat: CategoryResponse) => (
        <span className="text-sm text-slate-500">
          {new Date(cat.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-32',
      render: (category: CategoryResponse) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(category);
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
                handleEdit(category);
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
                handleDelete(category);
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

  // Parent filter options
  const parentOptions = useMemo(() => {
    const parents = allCategories?.filter((c: CategoryResponse) => !c.parentId) || [];
    return [
      { value: '', label: 'All Categories' },
      { value: 'null', label: 'Root Categories Only' },
      ...parents.map((c: CategoryResponse) => ({ value: c.id, label: c.name })),
    ];
  }, [allCategories]);

  return (
    <MasterPage
      title="Category Management"
      subtitle="Organize your products into categories"
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
      createLabel="Add Category"
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
            options={parentOptions}
            value={parentFilter}
            onChange={(e) => {
              setParentFilter(e.target.value);
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
              { value: 'createdAt:DESC', label: 'Newest First' },
              { value: 'createdAt:ASC', label: 'Oldest First' },
              { value: 'name:ASC', label: 'Name A-Z' },
              { value: 'name:DESC', label: 'Name Z-A' },
              { value: 'sortOrder:ASC', label: 'Sort Order (Low to High)' },
              { value: 'sortOrder:DESC', label: 'Sort Order (High to Low)' },
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
            <h3 className="text-lg font-medium text-slate-900 mb-2">Unable to load categories</h3>
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
            emptyMessage="No categories found"
            onRowClick={handleView}
          />

          {/* Pagination */}
          {data && data.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.meta.total)} of {data.meta.total} categories
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
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
      />

      <CategoryDetailDrawer
        isOpen={!!viewingCategory}
        onClose={() => setViewingCategory(null)}
        category={viewingCategory}
        onEdit={canUpdate ? handleEdit : undefined}
      />
    </MasterPage>
  );
}
