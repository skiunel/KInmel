'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string; value: string | number;
  change?: { value: number; label: string };
  icon: LucideIcon; variant?: 'default' | 'verified' | 'chain' | 'success';
  className?: string;
}

const iconBg: Record<string, string> = {
  default: 'bg-[#16a34a]/8 text-[#16a34a]',
  verified: 'bg-amber-50 text-amber-500',
  chain: 'bg-teal-50 text-teal-500',
  success: 'bg-emerald-50 text-emerald-500',
};

export function StatCard({ label, value, change, icon: Icon, variant = 'default', className }: StatCardProps) {
  return (
    <div className={cn('rounded-xl border border-[#e4e4e7] bg-white p-5 transition-all duration-200 hover:shadow-md', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#a1a1aa]">{label}</p>
          <p className="mt-1 text-2xl font-bold text-[#18181B] tracking-tight">{value}</p>
          {change && (
            <p className={cn('mt-1 text-xs font-medium', change.value >= 0 ? 'text-emerald-600' : 'text-red-500')}>
              {change.value >= 0 ? '+' : ''}{change.value}% {change.label}
            </p>
          )}
        </div>
        <div className={cn('rounded-xl p-2.5', iconBg[variant])}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
