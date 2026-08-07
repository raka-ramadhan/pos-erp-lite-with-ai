import { cn } from '../../utils/cn';

interface DividerProps {
  text?: string;
  className?: string;
}

export function Divider({ text, className }: DividerProps) {
  if (!text) {
    return <hr className={cn('border-slate-200 my-6', className)} />;
  }

  return (
    <div className={cn('flex items-center gap-4 my-6', className)}>
      <hr className="flex-1 border-slate-200" />
      <span className="text-sm text-slate-400">{text}</span>
      <hr className="flex-1 border-slate-200" />
    </div>
  );
}
