'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="storefront-card transition-shadow hover:shadow-[0_18px_40px_rgba(67,56,43,0.1)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/8 px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-500">
              Order
            </p>
            <p className="text-sm font-bold font-mono text-slate-900">
              {order.orderNumber}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-500">
              Placed
            </p>
            <p className="text-sm text-slate-900">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-500">
              Total
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {formatPrice(order.totalAmount)}
            </p>
          </div>
        </div>
        <OrderStatusBadge status={order.status} size="md" />
      </div>

      {/* Items preview */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          {/* Image stack */}
          <div className="flex -space-x-3">
            {order.items.slice(0, 4).map((item, i) => (
              <div
                key={i}
                className="relative h-12 w-12 overflow-hidden rounded-lg border-2 border-white bg-[linear-gradient(180deg,#f5f0e9_0%,#e6edf8_100%)]"
                style={{ zIndex: order.items.length - i }}
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[9px] text-slate-500">
                    N/A
                  </div>
                )}
              </div>
            ))}
            {order.items.length > 4 && (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-white bg-slate-100 text-xs font-medium text-slate-500">
                +{order.items.length - 4}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm text-slate-900">
              {order.items.map((i) => i.name).join(', ')}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-slate-600 hover:bg-black/[0.03] hover:text-slate-900"
            render={<Link href={ROUTES.order(order._id)} />}
          >
            Details
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
