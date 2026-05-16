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
    <div className="border border-[#0A0A0A]/10 bg-white p-6">
      <h3 className="font-heading text-2xl font-black text-[#0A0A0A] mb-1">Order Summary</h3>
      <p className="text-xs text-[#0A0A0A]/40 font-mono uppercase tracking-widest">
        {items.length} item{items.length !== 1 ? 's' : ''}
      </p>

      <div className="my-5 h-px bg-white/10" />

      {/* Items */}
      <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.product._id} className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-none border border-[#0A0A0A]/10 bg-gradient-to-br from-[#E63946]/20 to-[#E63946]/10">
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
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-none bg-[#E63946] text-[10px] font-bold text-[#0A0A0A] shadow-[0_0_8px_rgba(230,57,70,0.6)]">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-semibold text-[#0A0A0A]">
                {item.product.name}
              </p>
              <p className="text-xs text-[#0A0A0A]/40 font-mono">
                {formatPrice(item.price)} each
              </p>
            </div>
            <p className="whitespace-nowrap text-sm font-bold text-[#0A0A0A]">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="my-5 h-px bg-white/10" />

      {/* Totals */}
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-[#0A0A0A]/60">Subtotal</span>
          <span className="text-[#0A0A0A]">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#0A0A0A]/60">Shipping</span>
          <span className={shippingCost === 0 ? 'text-[#00FF88]' : 'text-[#0A0A0A]'}>
            {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#0A0A0A]/60">VAT (13%)</span>
          <span className="text-[#0A0A0A]">{formatPrice(taxAmount)}</span>
        </div>

        <div className="my-3 h-px bg-white/10" />

        <div className="flex justify-between items-baseline">
          <span className="text-[#0A0A0A]/80 font-semibold">Total</span>
          <span
            className="font-heading text-2xl font-black"
            style={{ color: '#E63946' }}
          >
            {formatPrice(totalAmount)}
          </span>
        </div>

        {shippingCost > 0 && (
          <p className="pt-1 text-center text-xs text-[#0A0A0A]/40">
            Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
          </p>
        )}
      </div>

      <div className="my-5 h-px bg-white/10" />

      {/* Trust signals */}
      <div className="space-y-2.5">
        <TrustRow icon={Lock} color="#E63946">
          Secure 256-bit SSL encryption
        </TrustRow>
        <TrustRow icon={Truck} color="#E63946">
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
    <div className="flex items-center gap-2 text-xs text-[#0A0A0A]/60">
      <Icon className="size-3.5 shrink-0" style={{ color }} />
      <span>{children}</span>
    </div>
  );
}
