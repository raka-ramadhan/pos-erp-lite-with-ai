import { cn } from '../../utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className }: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center', sizes[size])}>
        <svg
          className={cn(iconSizes[size], 'text-white')}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-slate-900 leading-tight">POS Cashier</span>
        <span className="text-xs text-slate-500 leading-tight">Point of Sale</span>
      </div>
    </div>
  );
}
