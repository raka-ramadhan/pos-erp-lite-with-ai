import { Logo } from '../../components/common';
import { motion } from 'framer-motion';

export function BrandSection() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo size="lg" className="mb-6" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl font-bold text-white mb-4"
      >
        POS Cashier System
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-indigo-100 text-lg max-w-md"
      >
        Streamline your restaurant operations with our modern point of sale solution
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center gap-8 mt-12"
      >
        <div className="text-center">
          <div className="text-3xl font-bold text-white">Fast</div>
          <div className="text-sm text-indigo-200">Quick Service</div>
        </div>
        <div className="w-px h-12 bg-indigo-400/30" />
        <div className="text-center">
          <div className="text-3xl font-bold text-white">Easy</div>
          <div className="text-sm text-indigo-200">Simple Interface</div>
        </div>
        <div className="w-px h-12 bg-indigo-400/30" />
        <div className="text-center">
          <div className="text-3xl font-bold text-white">Secure</div>
          <div className="text-sm text-indigo-200">Safe Transactions</div>
        </div>
      </motion.div>
    </div>
  );
}
