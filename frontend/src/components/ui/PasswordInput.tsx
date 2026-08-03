import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Input } from './Input';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export function PasswordInput({
  label = 'Password',
  error,
  className,
  id,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          label={label}
          error={error}
          id={inputId}
          className={cn('pr-12', className)}
          autoComplete="current-password"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:text-slate-600"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
