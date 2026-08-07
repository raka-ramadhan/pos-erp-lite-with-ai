import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldX, LogOut } from 'lucide-react';
import { Button } from '../../components/ui';
import { useLogout } from '../../hooks';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export function ForbiddenPage() {
  useDocumentTitle('Access Denied');
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  const handleGoToLogin = () => {
    logoutMutation.mutate();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center"
          >
            <ShieldX className="w-10 h-10 text-red-600" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-slate-900 mb-2"
          >
            Access Denied
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-slate-500 mb-6"
          >
            You do not have permission to access the POS Cashier application.
            <br />
            <span className="text-sm">
              Only users with the <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">cashier</code> role can access this area.
            </span>
          </motion.p>

          {/* Error Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left"
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-red-700">
                <p className="font-medium">Permission Error</p>
                <p className="mt-1">Your account does not have the required permissions to access this POS system. Please contact your administrator.</p>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-3"
          >
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              leftIcon={<LogOut className="w-5 h-5" />}
              onClick={handleGoToLogin}
              isLoading={logoutMutation.isPending}
            >
              Back to Login
            </Button>
          </motion.div>
        </div>

        {/* Help Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-slate-400 mt-6"
        >
          Need help? Contact your system administrator.
        </motion.p>
      </motion.div>
    </div>
  );
}

export default ForbiddenPage;
