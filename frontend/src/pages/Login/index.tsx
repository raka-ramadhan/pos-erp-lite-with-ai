import { motion } from 'framer-motion';
import { BrandSection } from '../../components/layout';
import { LoginCard } from './LoginCard';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export function LoginPage() {
  useDocumentTitle('Sign In');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Side - Brand Section (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 relative overflow-hidden">
        <div className="relative z-10 w-full">
          <BrandSection />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <LoginCard />
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;
