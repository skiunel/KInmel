import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function DashboardCard({ title, children, action, className }: DashboardCardProps) {
  return (
    <div className={cn('glass-card p-6', className)}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-black text-white">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
