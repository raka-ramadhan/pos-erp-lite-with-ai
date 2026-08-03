import { motion } from 'framer-motion';
import { Card, CardHeader, CardBody } from '../../components/ui';
import { LoginForm } from './LoginForm';
import { Logo } from '../../components/common';

export function LoginCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="lg:hidden flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="text-2xl font-bold text-slate-900 text-center"
          >
            Welcome back
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="text-slate-500 text-center mt-2"
          >
            Enter your credentials to access your account
          </motion.p>
        </CardHeader>

        <CardBody>
          <LoginForm />
        </CardBody>
      </Card>
    </motion.div>
  );
}
