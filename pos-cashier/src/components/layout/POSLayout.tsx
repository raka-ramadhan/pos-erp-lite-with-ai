import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Clock, ChevronRight, Home } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useLogout } from '../../hooks';
import { Button } from '../ui';
import { Logo } from '../common';
import { cn } from '../../utils/cn';

// Breadcrumb item
interface BreadcrumbItem {
  label: string;
  path?: string;
}

export function POSLayout({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const logoutMutation = useLogout();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time: HH:MM:SS
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  // Navigate to home
  const handleGoHome = () => {
    navigate('/pos');
  };

  // Determine breadcrumbs based on path
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    const items: BreadcrumbItem[] = [{ label: 'Home', path: '/pos' }];

    if (path.includes('/order-type')) {
      items.push({ label: 'Pilih Tipe Order' });
    } else if (path.includes('/tables')) {
      items.push({ label: 'Pilih Meja' });
    } else if (path.includes('/products')) {
      items.push({ label: 'Pilih Menu' });
    } else if (path.includes('/cart')) {
      items.push({ label: 'Keranjang' });
    } else if (path.includes('/payment')) {
      items.push({ label: 'Pembayaran' });
    } else if (path.includes('/receipt')) {
      items.push({ label: 'Struk' });
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="px-4 lg:px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Home Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleGoHome}
                className="flex items-center gap-2 p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Logo size="md" />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-slate-900 leading-tight">POS</h1>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Cashier</p>
                </div>
              </button>
            </div>

            {/* Center: Clock & Date */}
            <div className="hidden md:flex flex-col items-center">
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4" />
                <span className="text-2xl font-mono font-semibold tabular-nums">
                  {formatTime(currentTime)}
                </span>
              </div>
              <span className="text-xs text-slate-500">{formatDate(currentTime)}</span>
            </div>

            {/* Right: User Info & Actions */}
            <div className="flex items-center gap-2">
              {/* History Link */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/pos/history')}
                className={cn(
                  'text-slate-600 hover:text-amber-600 hover:bg-amber-50',
                  location.pathname.includes('/history') && 'text-amber-600 bg-amber-50'
                )}
              >
                <Clock className="w-4 h-4" />
                <span className="hidden lg:inline ml-2">Riwayat</span>
              </Button>

              {/* User Info */}
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <div className="text-right">
                    <p className="font-medium text-slate-900">{user?.name || 'Cashier'}</p>
                  </div>
                  <div className="p-2 bg-amber-100 rounded-full">
                    <User className="w-4 h-4 text-amber-600" />
                  </div>
                </div>

                {/* Mobile User Icon */}
                <div className="sm:hidden p-2 bg-amber-100 rounded-full">
                  <User className="w-4 h-4 text-amber-600" />
                </div>

                {/* Logout Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  isLoading={logoutMutation.isPending}
                  className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline ml-2">Logout</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom: Breadcrumbs */}
          {breadcrumbs.length > 1 && (
            <nav className="flex items-center gap-1 py-2 text-sm">
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400 mx-1" />}
                  {item.path && index < breadcrumbs.length - 1 ? (
                    <button
                      onClick={() => navigate(item.path!)}
                      className="text-slate-500 hover:text-amber-600 transition-colors"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span className="text-slate-900 font-medium">{item.label}</span>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children || <Outlet />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default POSLayout;
