import { forwardRef, type InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string;
  label?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
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
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            className={cn(
              'w-full px-3 py-2 pr-10 border rounded-lg text-slate-900 placeholder-slate-400',
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
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
export { PasswordInput };
export type { PasswordInputProps };
