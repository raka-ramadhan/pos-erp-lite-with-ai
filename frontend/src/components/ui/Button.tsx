import { forwardRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className,
  leftIcon,
  rightIcon,
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 active:scale-[0.98]',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-500 active:scale-[0.98]',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-500',
    link: 'text-indigo-600 hover:text-indigo-700 hover:underline focus:ring-indigo-500 p-0',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        baseStyles,
        variants[variant],
        variant !== 'link' && sizes[size],
        !isDisabled && 'hover:scale-[1.01] active:scale-[0.98]',
        className
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
