'use client';

import Image from 'next/image';
import { Shield, Truck, Lock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getEditorialImage } from '@/lib/editorial';
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
    <div className="storefront-panel-muted">
      <div className="pb-1">
        <h3 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">Order summary</h3>
      </div>

      <Separator className="mt-4 bg-black/8" />

      {/* Items */}
      <div className="max-h-64 space-y-3 overflow-y-auto py-5">
        {items.map((item) => (
          <div key={item.product._id} className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[linear-gradient(180deg,#f5f0e9_0%,#e6edf8_100%)]">
              <Image
                src={item.product.images[0] || getEditorialImage(item.product, 0)}
                alt={item.product.name}
                fill
                unoptimized
                className="object-cover"
                sizes="48px"
              />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-medium text-slate-900">
                {item.product.name}
              </p>
              <p className="text-xs text-slate-500">
                {formatPrice(item.price)} each
              </p>
            </div>
            <p className="whitespace-nowrap text-sm font-semibold text-slate-900">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <Separator className="bg-black/8" />

      {/* Totals */}
      <div className="space-y-2 py-5 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Shipping</span>
          <span className={shippingCost === 0 ? 'font-medium text-[#657da8]' : 'font-medium text-slate-900'}>
            {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">VAT (13%)</span>
          <span className="font-medium text-slate-900">{formatPrice(taxAmount)}</span>
        </div>

        <Separator className="my-2 bg-black/8" />

        <div className="flex justify-between text-base font-semibold text-slate-900">
          <span>Total</span>
          <span>{formatPrice(totalAmount)}</span>
        </div>

        {shippingCost > 0 && (
          <p className="pt-1 text-center text-xs text-slate-500">
            Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
          </p>
        )}
      </div>

      <Separator className="bg-black/8" />

      {/* Trust signals */}
      <div className="space-y-2.5 pt-5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Lock className="size-3.5 text-[#657da8]" />
          <span>Secure 256-bit SSL encryption</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Truck className="size-3.5 text-[#7c8fb5]" />
          <span>Estimated delivery in 5–7 business days</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Shield className="size-3.5 text-slate-600" />
          <span>Blockchain-verified product reviews</span>
        </div>
      </div>
    </div>
  );
}
