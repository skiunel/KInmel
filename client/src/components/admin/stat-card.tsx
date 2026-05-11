'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: { value: number; label: string };
  icon: LucideIcon;
  variant?: 'default' | 'verified' | 'chain' | 'success';
  className?: string;
}

const iconStyle: Record<string, { bg: string; color: string; ring: string }> = {
  default: { bg: 'bg-[#6C63FF]/15', color: '#6C63FF', ring: 'rgba(108,99,255,0.3)' },
  verified: { bg: 'bg-[#FFD700]/15', color: '#FFD700', ring: 'rgba(255,215,0,0.3)' },
  chain: { bg: 'bg-[#00F5FF]/15', color: '#00F5FF', ring: 'rgba(0,245,255,0.3)' },
  success: { bg: 'bg-[#00FF88]/15', color: '#00FF88', ring: 'rgba(0,255,136,0.3)' },
};

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  variant = 'default',
  className,
}: StatCardProps) {
  const s = iconStyle[variant];
  return (
    <div className={cn('glass-card p-5 float', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">
            {label}
          </p>
          <p
            className="mt-2 font-heading text-3xl font-black"
            style={{ color: s.color }}
          >
            {value}
          </p>
          {change && (
            <p
              className={cn(
                'mt-1 text-xs font-semibold',
                change.value >= 0 ? 'text-[#00FF88]' : 'text-[#FF6B6B]'
              )}
            >
              {change.value >= 0 ? '+' : ''}
              {change.value}% {change.label}
            </p>
          )}
        </div>
        <div
          className={cn('rounded-2xl p-3 border', s.bg)}
          style={{
            borderColor: s.ring,
            boxShadow: `0 0 24px ${s.ring}`,
          }}
        >
          <Icon className="size-5" style={{ color: s.color }} />
        </div>
      </div>
    </div>
  );
}
