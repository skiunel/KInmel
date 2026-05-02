import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface DashboardCardProps { title: string; children: ReactNode; action?: ReactNode; className?: string; }

export function DashboardCard({ title, children, action, className }: DashboardCardProps) {
  return (
    <div className={cn('rounded-xl border border-[#e4e4e7] bg-white p-5', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#18181B]">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
