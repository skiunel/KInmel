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
    className: 'bg-[#f6efe4] text-[#8a6b41] border-[#eadcc6]',
  },
  confirmed: {
    icon: CheckCircle2,
    className: 'bg-[#e7eef9] text-[#546989] border-[#cfdbef]',
  },
  processing: {
    icon: Package,
    className: 'bg-[#edf1f8] text-[#5c6880] border-[#d7deea]',
  },
  shipped: {
    icon: Truck,
    className: 'bg-[#eef2fb] text-[#5f7395] border-[#d8e1f1]',
  },
  out_for_delivery: {
    icon: MapPin,
    className: 'bg-[#eaf3f4] text-[#4f7b82] border-[#d1e4e7]',
  },
  delivered: {
    icon: CircleCheck,
    className: 'bg-[#edf5ef] text-[#51725d] border-[#d6e6da]',
  },
  cancelled: {
    icon: XCircle,
    className: 'bg-[#f9ecec] text-[#9b5d5d] border-[#efd3d3]',
  },
  returned: {
    icon: RotateCcw,
    className: 'bg-[#f1f2f4] text-[#69707a] border-[#dde0e6]',
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
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
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
  pending: 'bg-[#f6efe4] text-[#8a6b41] border-[#eadcc6]',
  paid: 'bg-[#edf5ef] text-[#51725d] border-[#d6e6da]',
  failed: 'bg-[#f9ecec] text-[#9b5d5d] border-[#efd3d3]',
  refunded: 'bg-[#f1f2f4] text-[#69707a] border-[#dde0e6]',
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
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        PAYMENT_CONFIG[status] || PAYMENT_CONFIG.pending,
        className
      )}
    >
      {PAYMENT_LABELS[status] || status}
    </span>
  );
}
