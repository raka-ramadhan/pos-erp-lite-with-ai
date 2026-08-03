import { type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  text?: string;
}

export function Divider({ text, className, ...props }: DividerProps) {
  if (!text) {
    return <hr className={cn('border-slate-200', className)} {...props} />;
  }

  return (
    <div className={cn('flex items-center gap-4', className)} {...props}>
      <hr className="flex-1 border-slate-200" />
      <span className="text-sm text-slate-400 font-medium">{text}</span>
      <hr className="flex-1 border-slate-200" />
    </div>
  );
}
