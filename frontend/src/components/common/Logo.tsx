import { cn } from '../../utils/cn';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { container: 'w-8 h-8', icon: 'w-5 h-5' },
    md: { container: 'w-10 h-10', icon: 'w-6 h-6' },
    lg: { container: 'w-12 h-12', icon: 'w-7 h-7' },
    xl: { container: 'w-14 h-14', icon: 'w-8 h-8' },
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn(
        'flex items-center justify-center rounded-xl',
        'bg-gradient-to-br from-indigo-500 to-indigo-600',
        'shadow-lg shadow-indigo-500/25',
        sizes[size].container
      )}>
        <svg
          className={sizes[size].icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            fill="white"
            fillOpacity="0.9"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fillOpacity="0.6"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fillOpacity="0.8"
          />
        </svg>
      </div>
    </div>
  );
}

interface LogoWithTextProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export function LogoWithText({ className, size = 'md', showTagline = false }: LogoWithTextProps) {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center gap-3">
        <Logo size={size} />
        <span className={cn('font-bold text-slate-900', textSizes[size])}>
          Nexus
        </span>
      </div>
      {showTagline && (
        <span className="text-sm text-slate-500 mt-0.5">
          Build faster, scale further
        </span>
      )}
    </div>
  );
}
