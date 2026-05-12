'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { OrderStatusBadge } from './order-status-badge';
import type { Order } from '@/types';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="glass-card overflow-hidden hover:border-[#E63946]/40 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/40">Order</p>
            <p className="text-sm font-bold font-mono text-white">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/40">Placed</p>
            <p className="text-sm text-white/70">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/40">Total</p>
            <p className="text-sm font-semibold text-[#E63946]">{formatPrice(order.totalAmount)}</p>
          </div>
        </div>
        <OrderStatusBadge status={order.status} size="md" />
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {order.items.slice(0, 4).map((item, i) => (
              <div
                key={i}
                className="relative h-12 w-12 overflow-hidden rounded-xl border-2 border-[#07070F] bg-[#E63946]/10"
                style={{ zIndex: order.items.length - i }}
              >
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[9px] text-white/40">N/A</div>
                )}
              </div>
            ))}
            {order.items.length > 4 && (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#07070F] bg-white/[0.06] text-xs font-medium text-white/60">
                +{order.items.length - 4}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm text-white">{order.items.map((i) => i.name).join(', ')}</p>
            <p className="mt-0.5 text-xs text-white/40">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
          </div>

          <Link
            href={ROUTES.order(order._id)}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-[#E63946] hover:text-white transition-colors"
          >
            Details
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
