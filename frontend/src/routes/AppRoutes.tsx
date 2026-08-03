import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/Login';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DashboardHome } from '../pages/Dashboard';
import { UsersPage } from '../pages/Users';
import { RolesPage } from '../pages/Roles';
import { PermissionsPage } from '../pages/Permissions';
import { MenusPage } from '../pages/Menus';

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
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
