import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: string;
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, error, label, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-3 py-2 bg-white border rounded-lg text-slate-900 text-sm',
            'placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            'transition-colors',
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-300 hover:border-slate-400',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps, SelectOption };
