import { useState, useMemo, useEffect } from 'react';
import { Pencil, Trash2, RefreshCw, Eye, Square } from 'lucide-react';
import { MasterPage } from '../../components/master/MasterPage';
import { MasterTable } from '../../components/master/MasterTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { DiningTableModal } from './DiningTableModal';
import { DiningTableDetailDrawer } from './DiningTableDetailDrawer';
import {
  useDiningTables,
  useDeleteDiningTable,
  useDistinctAreas,
} from '../../hooks/useDiningTables';
import { useHasPermission } from '../../hooks/usePermission';
import type { DiningTableResponse, DiningTableStatus } from '../../api/dining-table.api';

const STATUS_CONFIG: Record<DiningTableStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'default' }> = {
  available: { label: 'Available', variant: 'success' },
  reserved: { label: 'Reserved', variant: 'warning' },
  cleaning: { label: 'Cleaning', variant: 'info' },
  inactive: { label: 'Inactive', variant: 'default' },
};

export function DiningTablesPage() {
  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<DiningTableStatus | 'all'>('all');
  const [sort, setSort] = useState<'tableCode' | 'tableName' | 'areaName' | 'capacity' | 'sortOrder' | 'status' | 'createdAt'>('createdAt');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<DiningTableResponse | null>(null);
  const [viewingTable, setViewingTable] = useState<DiningTableResponse | null>(null);

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
    areaName: areaFilter || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  }), [page, debouncedSearch, sort, order, statusFilter, areaFilter]);

  // Queries
  const { data, isLoading, isFetching, refetch, error } = useDiningTables(params);
  const deleteTable = useDeleteDiningTable();
  const { data: areas } = useDistinctAreas();

  // Permissions
  const canCreate = useHasPermission('create_diningtables');
  const canUpdate = useHasPermission('update_diningtables');
  const canDelete = useHasPermission('delete_diningtables');

  // Handlers
  const handleCreate = () => {
    setEditingTable(null);
    setIsModalOpen(true);
  };

  const handleEdit = (table: DiningTableResponse) => {
    setEditingTable(table);
    setIsModalOpen(true);
  };

  const handleView = (table: DiningTableResponse) => {
    setViewingTable(table);
  };

  const handleDelete = async (table: DiningTableResponse) => {
    if (window.confirm(`Are you sure you want to delete table "${table.tableName}"?`)) {
      try {
        await deleteTable.mutateAsync(table.id);
      } catch (error) {
        console.error('Failed to delete table:', error);
      }
    }
  };

  // Area filter options
  const areaOptions = useMemo(() => {
    const areaList = areas || [];
    return [
      { value: '', label: 'All Areas' },
      ...areaList.map((area) => ({ value: area, label: area })),
    ];
  }, [areas]);

  // Columns
  const columns = [
    {
      key: 'tableCode',
      header: 'Code',
      render: (table: DiningTableResponse) => (
        <span className="text-sm font-mono text-slate-600">{table.tableCode}</span>
      ),
    },
    {
      key: 'tableName',
      header: 'Table Name',
      render: (table: DiningTableResponse) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Square className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-slate-900">{table.tableName}</span>
        </div>
      ),
    },
    {
      key: 'areaName',
      header: 'Area',
      render: (table: DiningTableResponse) => (
        <span className="text-sm text-slate-600">{table.areaName || '-'}</span>
      ),
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (table: DiningTableResponse) => (
        <span className="text-sm text-slate-600">{table.capacity} seats</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (table: DiningTableResponse) => {
        const config = STATUS_CONFIG[table.status] || STATUS_CONFIG.available;
        return (
          <Badge variant={config.variant} size="sm">
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (table: DiningTableResponse) => (
        <span className="text-sm text-slate-500">
          {new Date(table.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-32',
      render: (table: DiningTableResponse) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(table);
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
                handleEdit(table);
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
                handleDelete(table);
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
      title="Dining Tables"
      subtitle="Manage restaurant seating tables"
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
      createLabel="Add Table"
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
            options={areaOptions}
            value={areaFilter}
            onChange={(e) => {
              setAreaFilter(e.target.value);
              setPage(1);
            }}
          />
          <Select
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'available', label: 'Available' },
              { value: 'reserved', label: 'Reserved' },
              { value: 'cleaning', label: 'Cleaning' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as DiningTableStatus | 'all');
              setPage(1);
            }}
          />
          <Select
            options={[
              { value: 'createdAt:DESC', label: 'Newest First' },
              { value: 'createdAt:ASC', label: 'Oldest First' },
              { value: 'tableCode:ASC', label: 'Code A-Z' },
              { value: 'tableCode:DESC', label: 'Code Z-A' },
              { value: 'tableName:ASC', label: 'Name A-Z' },
              { value: 'tableName:DESC', label: 'Name Z-A' },
              { value: 'capacity:ASC', label: 'Capacity (Low to High)' },
              { value: 'capacity:DESC', label: 'Capacity (High to Low)' },
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
            <h3 className="text-lg font-medium text-slate-900 mb-2">Unable to load dining tables</h3>
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
            emptyMessage="No dining tables found"
            onRowClick={handleView}
          />

          {/* Pagination */}
          {data && data.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.meta.total)} of {data.meta.total} tables
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
      <DiningTableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        table={editingTable}
      />

      <DiningTableDetailDrawer
        isOpen={!!viewingTable}
        onClose={() => setViewingTable(null)}
        table={viewingTable}
        onEdit={canUpdate ? handleEdit : undefined}
      />
    </MasterPage>
  );
}
