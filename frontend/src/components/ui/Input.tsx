import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  className,
  type = 'text',
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={inputId}
        className={cn(
          'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400',
          'transition-all duration-200',
          'hover:border-slate-300',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
          'disabled:bg-slate-50 disabled:cursor-not-allowed',
          error && 'border-red-300 focus:ring-red-500/20 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-500" role="alert">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
export type { InputProps };
