'use client';

import Image from 'next/image';
import { Shield, Truck, Lock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import type { CartItem } from '@/types';

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
}

export function CheckoutSummary({
  items,
  subtotal,
  shippingCost,
  taxAmount,
  totalAmount,
}: CheckoutSummaryProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="font-heading text-2xl font-black text-white mb-1">Order Summary</h3>
      <p className="text-xs text-white/40 font-mono uppercase tracking-widest">
        {items.length} item{items.length !== 1 ? 's' : ''}
      </p>

      <div className="my-5 h-px bg-white/10" />

      {/* Items */}
      <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.product._id} className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#6C63FF]/20 to-[#00F5FF]/10">
              {item.product.images?.[0] ? (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-2xl">
                  📦
                </span>
              )}
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#6C63FF] text-[10px] font-bold text-white shadow-[0_0_8px_rgba(108,99,255,0.6)]">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-semibold text-white">
                {item.product.name}
              </p>
              <p className="text-xs text-white/40 font-mono">
                {formatPrice(item.price)} each
              </p>
            </div>
            <p className="whitespace-nowrap text-sm font-bold text-white">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="my-5 h-px bg-white/10" />

      {/* Totals */}
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-white/60">Subtotal</span>
          <span className="text-white">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Shipping</span>
          <span className={shippingCost === 0 ? 'text-[#00FF88]' : 'text-white'}>
            {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">VAT (13%)</span>
          <span className="text-white">{formatPrice(taxAmount)}</span>
        </div>

        <div className="my-3 h-px bg-white/10" />

        <div className="flex justify-between items-baseline">
          <span className="text-white/80 font-semibold">Total</span>
          <span
            className="font-heading text-2xl font-black"
            style={{ color: '#6C63FF' }}
          >
            {formatPrice(totalAmount)}
          </span>
        </div>

        {shippingCost > 0 && (
          <p className="pt-1 text-center text-xs text-white/40">
            Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
          </p>
        )}
      </div>

      <div className="my-5 h-px bg-white/10" />

      {/* Trust signals */}
      <div className="space-y-2.5">
        <TrustRow icon={Lock} color="#6C63FF">
          Secure 256-bit SSL encryption
        </TrustRow>
        <TrustRow icon={Truck} color="#00F5FF">
          Estimated delivery in 5–7 business days
        </TrustRow>
        <TrustRow icon={Shield} color="#FFD700">
          Blockchain-verified product reviews
        </TrustRow>
      </div>
    </div>
  );
}

function TrustRow({
  icon: Icon,
  color,
  children,
}: {
  icon: typeof Shield;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-white/60">
      <Icon className="size-3.5 shrink-0" style={{ color }} />
      <span>{children}</span>
    </div>
  );
}
