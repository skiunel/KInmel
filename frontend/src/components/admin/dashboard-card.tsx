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
    <div className={cn('border border-[#0A0A0A]/10 bg-white p-6', className)}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="font-sans text-lg font-bold tracking-[-0.02em] text-[#0A0A0A]">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
