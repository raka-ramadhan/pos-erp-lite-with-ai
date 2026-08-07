import { motion } from 'framer-motion';
import { UtensilsCrossed, Coffee, ShoppingBag } from 'lucide-react';
import { cn } from '../../../utils';
import { OrderType, ORDER_TYPE_CONFIG } from '../../../types';

interface OrderTypeSelectorProps {
  onSelect: (type: OrderType) => void;
  isLoading?: boolean;
}

const iconMap = {
  UtensilsCrossed,
  Coffee,
  ShoppingBag,
};

export function OrderTypeSelector({ onSelect, isLoading }: OrderTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(ORDER_TYPE_CONFIG).map(([type, config], index) => {
        const Icon = iconMap[config.icon as keyof typeof iconMap];
        const orderType = type as OrderType;

        return (
          <motion.button
            key={type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => onSelect(orderType)}
            disabled={isLoading}
            className={cn(
              'group relative flex flex-col items-center justify-center p-8 rounded-2xl',
              'border-2 border-transparent',
              'bg-white shadow-sm hover:shadow-lg',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              config.bgColor,
              'hover:border-amber-400 hover:-translate-y-1'
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                'p-4 rounded-full mb-4 transition-transform duration-200',
                'group-hover:scale-110',
                config.bgColor
              )}
            >
              <Icon
                className={cn('w-12 h-12', config.color)}
                strokeWidth={1.5}
              />
            </div>

            {/* Label */}
            <h3 className={cn('text-xl font-bold mb-2', config.color)}>
              {config.label}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-500 text-center">
              {config.description}
            </p>

            {/* Arrow indicator */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                className={cn('w-5 h-5', config.color)}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
