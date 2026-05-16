'use client';

import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  CircleCheck,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import type { OrderStatus, PaymentStatus } from '@/types';

// ─── Order Status Badge ───

const STATUS_CONFIG: Record<
  string,
  { icon: typeof Clock; className: string }
> = {
  pending: {
    icon: Clock,
    className: 'bg-[#E63946] text-white',
  },
  confirmed: {
    icon: CheckCircle2,
    className: 'bg-white text-[#0A0A0A] border border-[#0A0A0A]/15',
  },
  processing: {
    icon: Package,
    className: 'bg-white text-[#0A0A0A] border border-[#0A0A0A]/15',
  },
  shipped: {
    icon: Truck,
    className: 'bg-[#0A0A0A]/65 text-white',
  },
  out_for_delivery: {
    icon: MapPin,
    className: 'bg-[#0A0A0A]/65 text-white',
  },
  delivered: {
    icon: CircleCheck,
    className: 'bg-[#0A0A0A] text-white',
  },
  cancelled: {
    icon: XCircle,
    className: 'bg-white text-[#E63946] border border-[#E63946]',
  },
  returned: {
    icon: RotateCcw,
    className: 'bg-[#F4F4F4] text-[#0A0A0A]/65 border border-[#0A0A0A]/10',
  },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export function OrderStatusBadge({
  status,
  size = 'sm',
  className,
}: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  const label = ORDER_STATUS_LABELS[status] || status;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono font-bold uppercase tracking-[0.18em]',
        size === 'sm' ? 'px-2.5 py-1 text-[9px]' : 'px-3 py-1 text-[10px]',
        config.className,
        className
      )}
    >
      <Icon className={size === 'sm' ? 'size-3' : 'size-3.5'} />
      {label}
    </span>
  );
}

// ─── Payment Status Badge ───

const PAYMENT_CONFIG: Record<string, string> = {
  pending: 'bg-[#E63946] text-white',
  paid: 'bg-[#0A0A0A] text-white',
  failed: 'bg-white text-[#E63946] border border-[#E63946]',
  refunded: 'bg-[#F4F4F4] text-[#0A0A0A]/65 border border-[#0A0A0A]/10',
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: 'Unpaid',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em]',
        PAYMENT_CONFIG[status] || PAYMENT_CONFIG.pending,
        className
      )}
    >
      {PAYMENT_LABELS[status] || status}
    </span>
  );
}
