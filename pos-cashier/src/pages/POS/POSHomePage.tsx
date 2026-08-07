import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { UtensilsCrossed, ShoppingBag, Truck, CalendarDays, User, Loader2 } from 'lucide-react';
import type { RootState } from '../../store';
import { setOrderType, resetPOS } from '../../store/slices/posSlice';
import { OrderType, ORDER_TYPE_CONFIG } from '../../types';
import { cn } from '../../utils';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useCreateOrder } from '../../hooks';

// Order type config with delivery
const ORDER_TYPES = [
  {
    type: OrderType.DINE_IN_TABLE,
    ...ORDER_TYPE_CONFIG[OrderType.DINE_IN_TABLE],
    icon: UtensilsCrossed,
    disabled: false,
  },
  {
    type: OrderType.TAKEAWAY,
    ...ORDER_TYPE_CONFIG[OrderType.TAKEAWAY],
    icon: ShoppingBag,
    disabled: false,
  },
  // Delivery - Coming Soon
  {
    type: 'delivery' as OrderType,
    label: 'Delivery',
    description: 'Pesanan diantar ke lokasi pelanggan',
    icon: Truck,
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
    hoverBgColor: '',
    disabled: true,
  },
];

export function POSHomePage() {
  useDocumentTitle('POS Cashier - Home');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const createOrder = useCreateOrder();
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectOrderType = async (type: OrderType, disabled: boolean) => {
    if (disabled || isCreating) return;

    // Reset POS state for new order
    dispatch(resetPOS());

    // Set order type
    dispatch(setOrderType(type));

    // Navigate based on order type
    if (type === OrderType.DINE_IN_TABLE) {
      navigate('/pos/tables');
    } else if (type === OrderType.TAKEAWAY) {
      // Create takeaway order immediately
      setIsCreating(true);
      try {
        await createOrder.mutateAsync({
          orderType: 'take_away' as const,
          customerCount: 1,
        });
        // Navigation happens in onSuccess callback
      } catch (err) {
        console.error('Failed to create takeaway order:', err);
        setIsCreating(false);
      }
    } else if (type === OrderType.DINE_IN_QUICK) {
      // Create quick service order immediately
      setIsCreating(true);
      try {
        await createOrder.mutateAsync({
          orderType: 'dine_in' as const,
          customerCount: 1,
        });
        // Navigation happens in onSuccess callback
      } catch (err) {
        console.error('Failed to create quick service order:', err);
        setIsCreating(false);
      }
    } else {
      // Other types - go directly to products (for now)
      navigate('/pos/products');
    }
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  // Get current date formatted
  const getFormattedDate = () => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-full py-6 px-4 lg:px-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Kasir'}! 👋
        </h1>
        <p className="text-lg text-slate-500">Siap untuk melayani pelanggan hari ini?</p>
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-w-3xl mx-auto"
      >
        {/* Date */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <CalendarDays className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Tanggal</p>
            <p className="text-sm font-semibold text-slate-900">{getFormattedDate()}</p>
          </div>
        </div>

        {/* Cashier */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <User className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Kasir</p>
            <p className="text-sm font-semibold text-slate-900">{user?.name || 'Kasir'}</p>
          </div>
        </div>
      </motion.div>

      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-center mb-6"
      >
        <h2 className="text-xl font-semibold text-slate-900 mb-1">
          Pilih Tipe Pemesanan
        </h2>
        <p className="text-slate-500">
          Bagaimana pelanggan ingin menikmati pesanannya?
        </p>
      </motion.div>

      {/* Order Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {ORDER_TYPES.map((orderType, index) => {
          const Icon = orderType.icon;
          const isDisabled = orderType.disabled;

          return (
            <motion.button
              key={orderType.type}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              onClick={() => handleSelectOrderType(orderType.type, isDisabled)}
              disabled={isDisabled || isCreating}
              disabled={isDisabled}
              className={cn(
                'group relative flex flex-col items-center justify-center p-8 rounded-3xl',
                'border-2 transition-all duration-300',
                isDisabled
                  ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-60'
                  : 'bg-white border-transparent shadow-lg hover:shadow-xl',
                'hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-amber-200'
              )}
            >
              {/* Disabled Overlay */}
              {isDisabled && (
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-slate-200 text-slate-600 text-xs font-medium rounded-full">
                    Coming Soon
                  </span>
                </div>
              )}

              {/* Icon */}
              <div
                className={cn(
                  'p-5 rounded-2xl mb-5 transition-all duration-300',
                  'group-hover:scale-110 group-hover:shadow-lg',
                  isDisabled ? 'bg-slate-100' : orderType.bgColor
                )}
              >
                <Icon
                  className={cn('w-14 h-14', isDisabled ? 'text-slate-400' : orderType.color)}
                  strokeWidth={1.5}
                />
              </div>

              {/* Label */}
              <h3 className={cn(
                'text-2xl font-bold mb-2 transition-colors',
                isDisabled ? 'text-slate-400' : orderType.color
              )}>
                {orderType.label}
              </h3>

              {/* Description */}
              <p className={cn(
                'text-sm text-center leading-relaxed',
                isDisabled ? 'text-slate-400' : 'text-slate-500'
              )}>
                {orderType.description}
              </p>

              {/* Arrow indicator (only for enabled) */}
              {!isDisabled && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <svg
                    className={cn('w-6 h-6', orderType.color)}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="mt-12 max-w-2xl mx-auto"
      >
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tips Singkat
          </h4>
          <ul className="text-sm text-amber-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span><strong>Dine In</strong> - Pelanggan makan di tempat dengan meja</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span><strong>Takeaway</strong> - Pelanggan memesan untuk dibawa pulang</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span><strong>Delivery</strong> - Pesanan diantar ke lokasi (segera hadir)</span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

export default POSHomePage;
