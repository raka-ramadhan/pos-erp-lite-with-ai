import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { LoginPage } from '../pages/Login';
import { ForbiddenPage } from '../pages/Forbidden';
import { POSLayout } from '../components/layout/POSLayout';
import { POSHomePage } from '../pages/POS/POSHomePage';
import { OrderTypePage } from '../pages/POS/OrderTypePage';
import { TablesPage } from '../pages/POS/TablesPage';
import { ProductsPage } from '../pages/POS/ProductsPage';
import { OrderSessionPage } from '../pages/POS/OrderSessionPage';
import { useEffect } from 'react';
import { useRefreshProfile } from '../hooks';
import { APP_PERMISSIONS } from '../types';

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const refreshProfile = useRefreshProfile();

  useEffect(() => {
    if (isAuthenticated && !user?.role) {
      refreshProfile.mutate();
    }
  }, [isAuthenticated, user, refreshProfile]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has cashier permission
  const hasCashierPermission = user?.role?.permissions?.includes(APP_PERMISSIONS.USE_CASHIER);
  const isCashierRole = user?.role?.code === 'cashier';

  if (!hasCashierPermission || !isCashierRole) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}

// Public Route Wrapper (redirects to POS if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/pos" replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Forbidden */}
      <Route
        path="/forbidden"
        element={
          <ProtectedRoute>
            <ForbiddenPage />
          </ProtectedRoute>
        }
      />

      {/* POS Routes with Layout */}
      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <POSLayout />
          </ProtectedRoute>
        }
      >
        {/* POS Home - Order Type Selection */}
        <Route index element={<POSHomePage />} />

        {/* Order Type Selection (standalone for quick restart) */}
        <Route path="order-type" element={<OrderTypePage />} />

        {/* Table Selection for Dine In */}
        <Route path="tables" element={<TablesPage />} />

        {/* Product Catalog */}
        <Route path="products" element={<ProductsPage />} />

        {/* Order Session */}
        <Route path="orders/:orderId" element={<OrderSessionPage />} />

        {/* Future Routes (placeholder comments for development) */}
        {/*
        <Route path="cart" element={<CartPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="receipt/:orderId" element={<ReceiptPage />} />
        <Route path="history" element={<HistoryPage />} />
        */}
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/pos" replace />} />
      <Route path="*" element={<Navigate to="/pos" replace />} />
    </Routes>
  );
}

export default AppRoutes;
