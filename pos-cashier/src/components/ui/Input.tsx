import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 border rounded-lg text-slate-900 placeholder-slate-400',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-200 hover:border-slate-300',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
export type { InputProps };
