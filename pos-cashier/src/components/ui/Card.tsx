import { cn } from '../../utils/cn';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-white rounded-2xl shadow-xl border border-slate-100', className)}>
      {children}
    </div>
  );
}

function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('px-6 py-5 sm:px-8 sm:py-6', className)}>
      {children}
    </div>
  );
}

function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={cn('px-6 pb-6 sm:px-8 sm:pb-8', className)}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardBody };
