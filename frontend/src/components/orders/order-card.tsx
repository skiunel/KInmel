'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { OrderStatusBadge } from './order-status-badge';
import type { Order } from '@/types';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const itemNames = order.items.map((i) => i.name).join(', ');

  return (
    <Link
      href={ROUTES.order(order._id)}
      className="group block border border-[#0A0A0A]/10 bg-white hover:border-[#0A0A0A] transition-colors"
    >
      {/* Meta strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0A0A0A]/10 px-5 py-3 bg-[#F4F4F4]">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <Stat label="Order" value={order.orderNumber} mono />
          <Stat label="Placed" value={formatDate(order.createdAt)} />
          <Stat label="Total" value={formatPrice(order.totalAmount)} />
        </div>
        <OrderStatusBadge status={order.status} size="md" />
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex items-center gap-4">
        <div className="flex -space-x-2">
          {order.items.slice(0, 4).map((item, i) => (
            <div
              key={i}
              className="relative h-12 w-12 overflow-hidden border-2 border-white bg-[#F4F4F4]"
              style={{ zIndex: order.items.length - i }}
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-[9px] text-[#0A0A0A]/40">
                  N/A
                </div>
              )}
            </div>
          ))}
          {order.items.length > 4 && (
            <div className="flex h-12 w-12 items-center justify-center border-2 border-white bg-[#0A0A0A] font-mono text-[10px] font-bold text-white">
              +{order.items.length - 4}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-semibold text-[#0A0A0A]">{itemNames}</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#0A0A0A]/45">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </p>
        </div>

        <span className="shrink-0 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#0A0A0A] group-hover:text-[#E63946] transition-colors">
          Details
          <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#0A0A0A]/45">{label}</p>
      <p className={`text-sm text-[#0A0A0A] ${mono ? 'font-mono font-semibold' : 'font-medium'}`}>
        {value}
      </p>
    </div>
  );
}
