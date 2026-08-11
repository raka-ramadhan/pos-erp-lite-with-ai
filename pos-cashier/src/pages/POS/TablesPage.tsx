import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Circle,
  AlertCircle,
  Wrench,
  Loader2,
  Sofa,
  Clock,
  ShoppingBag,
  ArrowRightLeft,
} from 'lucide-react';
import { usePOSTables, useTableAreas, useCreateOrder, type POSTable, type ActiveOrderInfo } from '../../hooks';
import { setSelectedTable, setCurrentOrder } from '../../store/slices/posSlice';
import { Button } from '../../components/ui';
import { cn } from '../../utils';
import { TABLE_STATUS_CONFIG, type DiningTable, type TableStatus, OrderType } from '../../types';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import ordersApi from '../../api/orders';

// Table status config with icons
const getStatusIcon = (status: TableStatus) => {
  switch (status) {
    case 'available':
      return <Circle className="w-5 h-5 text-green-600" />;
    case 'occupied':
      return <Users className="w-5 h-5 text-red-600" />;
    case 'reserved':
      return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    case 'maintenance':
      return <Wrench className="w-5 h-5 text-gray-600" />;
    default:
      return <Circle className="w-5 h-5 text-gray-400" />;
  }
};

// Format duration
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Format currency
const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export function TablesPage() {
  useDocumentTitle('Pilih Meja - POS');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: tables, isLoading, error, refetch, isFetching } = usePOSTables();
  const { data: areas } = useTableAreas();
  const createOrder = useCreateOrder();
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [changingTableId, setChangingTableId] = useState<string | null>(null);
  const [creatingOrderForTable, setCreatingOrderForTable] = useState<string | null>(null);

  // Group tables by area
  const tablesByArea = tables?.reduce(
    (acc, table) => {
      const area = table.areaName || 'Lainnya';
      if (!acc[area]) {
        acc[area] = [];
      }
      acc[area].push(table);
      return acc;
    },
    {} as Record<string, POSTable[]>
  ) || {};

  // Get unique areas from tables
  const availableAreas = Object.keys(tablesByArea).sort();

  // Filter tables by selected area
  const filteredArea = selectedArea || availableAreas[0];
  const tablesInArea = tablesByArea[filteredArea] || [];

  // Handle AVAILABLE table selection
  const handleSelectAvailableTable = async (table: POSTable) => {
    try {
      setCreatingOrderForTable(table.id);

      const order = await ordersApi.createOrderWithTable({
        orderType: 'dine_in',
        tableId: table.id,
        customerCount: 1,
      });

      dispatch(setCurrentOrder(order));
      dispatch(setSelectedTable(table));
      navigate('/pos/products');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message;

      if (errorMessage?.includes('already occupied')) {
        alert('Meja sudah digunakan cashier lain. Silakan pilih meja lain.');
        refetch();
      } else {
        console.error('Failed to create order:', err);
        alert('Gagal membuat order. Silakan coba lagi.');
      }
    } finally {
      setCreatingOrderForTable(null);
    }
  };

  // Handle OCCUPIED table selection - open existing order
  const handleSelectOccupiedTable = async (table: POSTable) => {
    if (!table.activeOrder) return;

    // Navigate to existing order - OrderSessionPage will fetch fresh order data
    navigate(`/pos/orders/${table.activeOrder.id}`);
  };

  // Handle Change Table
  const handleChangeTable = async (table: POSTable, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!table.activeOrder) return;

    setChangingTableId(table.id);
    // TODO: Show modal to select new table
    // For now, just show alert
    alert('Fitur Change Table akan segera hadir. Pilih meja lain terlebih dahulu.');
    setChangingTableId(null);
  };

  // Handle back
  const handleBack = () => {
    navigate('/pos');
  };

  // Refresh tables
  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Memuat daftar meja...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-900 font-medium mb-2">Gagal memuat daftar meja</p>
          <p className="text-slate-500 mb-4">{error.message}</p>
          <Button onClick={handleRefresh}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Kembali
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Pilih Meja</h1>
              <p className="text-sm text-slate-500">
                {tables?.length || 0} meja tersedia
              </p>
            </div>
          </div>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            isLoading={isFetching && !isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Area Tabs */}
      {availableAreas.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-4 py-2 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {availableAreas.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  filteredArea === area
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {area} ({tablesByArea[area]?.length || 0})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-4 py-3 mb-6">
        <div className="flex flex-wrap gap-4">
          {Object.entries(TABLE_STATUS_CONFIG).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={cn('p-1.5 rounded-lg', config.bgColor)}>
                {getStatusIcon(status as TableStatus)}
              </div>
              <span className={cn('text-sm font-medium', config.color)}>
                {config.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tables Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filteredArea}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tablesInArea.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Sofa className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Tidak ada meja di area ini</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {tablesInArea.map((table, index) => {
                const statusConfig = TABLE_STATUS_CONFIG[table.status];
                const isAvailable = table.status === 'available';
                const isOccupied = table.status === 'occupied';
                const isLoading = creatingOrderForTable === table.id;

                return (
                  <motion.button
                    key={table.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    onClick={() => isAvailable ? handleSelectAvailableTable(table) : isOccupied ? handleSelectOccupiedTable(table) : null}
                    disabled={isLoading || (!isAvailable && !isOccupied)}
                    className={cn(
                      'relative flex flex-col p-4 rounded-2xl',
                      'border-2 transition-all duration-200 text-left',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2',
                      isAvailable
                        ? cn(
                            'bg-white border-green-200 hover:border-green-400 hover:shadow-lg',
                            'hover:-translate-y-1 focus:ring-green-400 cursor-pointer'
                          )
                        : isOccupied
                        ? cn(
                            'bg-white border-red-200 hover:border-red-400 hover:shadow-lg',
                            'hover:-translate-y-1 focus:ring-red-400 cursor-pointer'
                          )
                        : cn(
                            'bg-slate-50 border-slate-200 cursor-not-allowed',
                            'opacity-75'
                          ),
                      isLoading && 'opacity-50 cursor-wait'
                    )}
                  >
                    {/* Loading Overlay */}
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl z-10">
                        <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div
                      className={cn(
                        'absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-medium',
                        statusConfig.bgColor,
                        statusConfig.color
                      )}
                    >
                      {statusConfig.label}
                    </div>

                    {/* Table Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {table.tableName}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {table.tableCode}
                        </p>
                      </div>
                      <div className={cn('p-2 rounded-lg', statusConfig.bgColor)}>
                        {isAvailable ? (
                          <CheckCircle2 className={cn('w-6 h-6', statusConfig.color)} />
                        ) : (
                          getStatusIcon(table.status)
                        )}
                      </div>
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                      <Users className="w-4 h-4" />
                      <span>{table.capacity} orang</span>
                    </div>

                    {/* Active Order Info (for occupied tables) */}
                    {table.activeOrder && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="space-y-1.5">
                          {/* Order Number */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Order</span>
                            <span className="text-xs font-mono font-medium text-slate-900">
                              #{table.activeOrder.orderNumber}
                            </span>
                          </div>

                          {/* Duration */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Durasi</span>
                            <span className="text-xs font-medium text-slate-900 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(table.activeOrder.durationMinutes)}
                            </span>
                          </div>

                          {/* Customer Count */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Pelanggan</span>
                            <span className="text-xs font-medium text-slate-900">
                              {table.activeOrder.customerCount} orang
                            </span>
                          </div>

                          {/* Total */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Total</span>
                            <span className="text-xs font-bold text-emerald-600">
                              {formatCurrency(table.activeOrder.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Hint */}
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      {isAvailable && (
                        <p className="text-xs text-green-600 font-medium text-center">
                          Tap untuk mulai order
                        </p>
                      )}
                      {isOccupied && table.activeOrder && (
                        <p className="text-xs text-amber-600 font-medium text-center">
                          Tap untuk lanjut order
                        </p>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Summary */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          <strong>Tips:</strong>
          {' '}Meja <span className="inline-flex items-center gap-1"><Circle className="w-3 h-3 text-green-600" />Tersedia</span> untuk order baru.
          {' '}Meja <span className="inline-flex items-center gap-1"><Users className="w-3 h-3 text-red-600" />Terisi</span> untuk lanjut order yang aktif.
        </p>
      </div>
    </div>
  );
}

export default TablesPage;
