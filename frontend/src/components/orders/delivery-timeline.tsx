'use client';

import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  CircleCheck,
  XCircle,
} from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';
import type { DeliveryUpdate } from '@/types';

const TIMELINE_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Package,
  shipped: Truck,
  out_for_delivery: MapPin,
  delivered: CircleCheck,
  cancelled: XCircle,
};

const TIMELINE_COLORS: Record<string, string> = {
  pending: 'text-amber-600 bg-amber-100',
  confirmed: 'text-blue-600 bg-blue-100',
  processing: 'text-indigo-600 bg-indigo-100',
  shipped: 'text-purple-600 bg-purple-100',
  out_for_delivery: 'text-cyan-600 bg-cyan-100',
  delivered: 'text-emerald-600 bg-emerald-100',
  cancelled: 'text-red-600 bg-red-100',
};

interface DeliveryTimelineProps {
  updates: DeliveryUpdate[];
  className?: string;
}

export function DeliveryTimeline({ updates, className }: DeliveryTimelineProps) {
  // Show most recent first
  const sorted = [...updates].reverse();

  return (
    <div className={cn('space-y-0', className)}>
      {sorted.map((update, i) => {
        const Icon = TIMELINE_ICONS[update.status] || Clock;
        const color = TIMELINE_COLORS[update.status] || TIMELINE_COLORS.pending;
        const isFirst = i === 0;
        const isLast = i === sorted.length - 1;

        return (
          <div key={update._id || i} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-[17px] top-10 bottom-0 w-px bg-border" />
            )}

            {/* Icon */}
            <div
              className={cn(
                'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                isFirst ? color : 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="size-4" />
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <p
                className={cn(
                  'text-sm font-medium',
                  isFirst ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {update.message}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span>{formatDateTime(update.timestamp)}</span>
                {update.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {update.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
