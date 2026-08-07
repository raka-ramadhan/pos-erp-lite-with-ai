import { motion } from 'framer-motion';
import { ShoppingCart, Receipt, Settings } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export function POSPage() {
  useDocumentTitle('POS Terminal');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">POS Terminal</h1>
        <p className="text-slate-500">Welcome to the POS Cashier System</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">New Order</h3>
                <p className="text-sm text-slate-500">Start a new transaction</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Receipt className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Orders</h3>
                <p className="text-sm text-slate-500">View active orders</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Settings className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Settings</h3>
                <p className="text-sm text-slate-500">Configure POS settings</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Placeholder Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
          </CardHeader>
          <CardBody>
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">POS Module Coming Soon</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                The POS Cashier application is ready. Full POS features will be implemented in the next phase.
              </p>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}

export default POSPage;
