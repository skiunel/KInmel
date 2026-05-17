'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: { value: number; label: string };
  icon: LucideIcon;
  variant?: 'default' | 'verified' | 'chain' | 'success';
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  variant = 'default',
  className,
}: StatCardProps) {
  const accent = variant === 'verified' ? '#E63946' : variant === 'success' ? '#0A0A0A' : '#0A0A0A';
  const isPositive = (change?.value ?? 0) >= 0;

  return (
    <div className={cn('border border-[#0A0A0A]/10 bg-white p-6', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/45">
          ◆ {label}
        </p>
        <Icon className="size-3.5 text-[#0A0A0A]/35" />
      </div>
      <p
        className="font-sans text-3xl md:text-4xl font-black tracking-[-0.02em] tabular-nums"
        style={{ color: accent }}
      >
        {value}
      </p>
      {change && (
        <p
          className={cn(
            'mt-2 font-mono text-[10px] inline-flex items-center gap-1 uppercase tracking-[0.16em]',
            isPositive ? 'text-[#0A0A0A]' : 'text-[#E63946]'
          )}
        >
          {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {isPositive ? '+' : ''}
          {change.value}% {change.label}
        </p>
      )}
    </div>
  );
}
