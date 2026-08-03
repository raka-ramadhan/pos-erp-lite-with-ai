import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `checkbox-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <label className={cn('inline-flex items-center gap-2 cursor-pointer group', className)}>
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className="peer sr-only"
          {...props}
        />
        <div className={cn(
          'w-5 h-5 rounded border-2 border-slate-200',
          'transition-all duration-200',
          'peer-checked:bg-indigo-600 peer-checked:border-indigo-600',
          'peer-focus:ring-2 peer-focus:ring-indigo-500/20 peer-focus:outline-none',
          'group-hover:border-slate-300',
          'peer-hover:border-indigo-300'
        )}>
          <Check
            className="w-full h-full p-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
            strokeWidth={3}
          />
        </div>
      </div>
      {label && (
        <span className="text-sm text-slate-600 select-none">{label}</span>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };
export type { CheckboxProps };
