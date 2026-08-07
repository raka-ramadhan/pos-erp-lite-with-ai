import { forwardRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200',
      link: 'bg-transparent text-indigo-600 hover:text-indigo-700 hover:underline p-0',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
    };

    if (variant === 'link') {
      return (
        <button
          ref={ref}
          className={cn(baseStyles, variants[variant], className)}
          disabled={disabled || isLoading}
          {...props}
        >
          {isLoading && <Spinner size="sm" />}
          {leftIcon}
          {children}
        </button>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Spinner size="sm" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
export type { ButtonProps };
