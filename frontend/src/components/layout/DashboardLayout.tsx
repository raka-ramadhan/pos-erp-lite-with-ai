import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { DynamicSidebar } from './DynamicSidebar';
import { Header } from './Header';
import { setSidebarOpen, setSidebarCollapsed } from '../../store/slices/uiSlice';
import type { RootState } from '../../store';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/users': 'Users',
  '/dashboard/roles': 'Roles & Permissions',
  '/dashboard/permissions': 'Permissions',
  '/dashboard/menus': 'Menus',
  '/dashboard/categories': 'Categories',
  '/dashboard/products': 'Products',
  '/dashboard/modifier-groups': 'Modifier Groups',
  '/dashboard/modifier': 'Modifiers',
  '/dashboard/taxes': 'Taxes',
  '/dashboard/payment-methods': 'Payment Methods',
  '/dashboard/discounts': 'Discounts',
  '/dashboard/orders': 'Orders',
  '/dashboard/reports': 'Reports',
  '/dashboard/settings': 'Settings',
  '/dashboard/menu-permissions': 'Menu Permissions',
};

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sidebarOpen, sidebarCollapsed } = useSelector((state: RootState) => state.ui);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  // Update document title when route changes
  useEffect(() => {
    const title = pageTitles[location.pathname] || 'Dashboard';
    document.title = `${title} | Nexus`;
  }, [location.pathname]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <DynamicSidebar
        isOpen={sidebarOpen}
        onClose={() => dispatch(setSidebarOpen(false))}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => dispatch(setSidebarCollapsed(!sidebarCollapsed))}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          title={pageTitle}
          onMenuClick={() => dispatch(setSidebarOpen(true))}
        />

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
