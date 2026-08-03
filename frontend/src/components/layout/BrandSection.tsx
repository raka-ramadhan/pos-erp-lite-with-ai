import { motion } from 'framer-motion';
import { LogoWithText } from '../common/Logo';

export function BrandSection() {
  return (
    <div className="hidden lg:flex flex-col justify-center w-full max-w-lg mx-auto px-12">
      {/* Logo & Branding */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <LogoWithText size="xl" showTagline />
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl font-bold text-slate-900 leading-tight mb-4"
      >
        Welcome to the future
        <br />
        <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
          of enterprise software
        </span>
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg text-slate-600 leading-relaxed mb-12"
      >
        Streamline your workflows, boost productivity, and scale your business
        with our all-in-one platform trusted by over 10,000 companies worldwide.
      </motion.p>

      {/* Feature Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-2 gap-4"
      >
        {[
          { title: '99.9%', subtitle: 'Uptime SLA' },
          { title: '256-bit', subtitle: 'Encryption' },
          { title: '24/7', subtitle: 'Support' },
          { title: 'SOC 2', subtitle: 'Certified' },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50"
          >
            <div className="text-2xl font-bold text-slate-900">{stat.title}</div>
            <div className="text-sm text-slate-500">{stat.subtitle}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
