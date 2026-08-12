import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/Login';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DashboardHome } from '../pages/Dashboard';
import { UsersPage } from '../pages/Users';
import { RolesPage } from '../pages/Roles';
import { PermissionsPage } from '../pages/Permissions';
import { MenusPage } from '../pages/Menus';
import { CategoriesPage } from '../pages/Categories';
import { ProductsPage } from '../pages/Products/index';
import { ModifierGroupsPage } from '../pages/ModifierGroups';
import { ModifiersPage } from '../pages/Modifiers';
import { TaxesPage } from '../pages/Taxes';
import { PaymentMethodsPage } from '../pages/PaymentMethods';
import { DiscountsPage } from '../pages/Discounts';
import { MenuPermissionsPage } from '../pages/MenuPermissions';
import { DiningTablesPage } from '../pages/DiningTables';
import { TransactionsPage } from '../pages/Transactions';

function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Register</h1>
        <p className="text-slate-600 mb-6">Registration page coming soon...</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Forgot Password</h1>
        <p className="text-slate-600 mb-6">Password reset page coming soon...</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Dashboard routes - protected with layout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="permissions" element={<PermissionsPage />} />
        <Route path="menus" element={<MenusPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="modifier-groups" element={<ModifierGroupsPage />} />
        <Route path="modifier" element={<ModifiersPage />} />
        <Route path="taxes" element={<TaxesPage />} />
        <Route path="payment-methods" element={<PaymentMethodsPage />} />
        <Route path="discounts" element={<DiscountsPage />} />
        <Route path="menu-permissions" element={<MenuPermissionsPage />} />
        <Route path="dining-tables" element={<DiningTablesPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
