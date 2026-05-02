'use client';

import Image from 'next/image';
import { MapPin, CreditCard, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEditorialImage } from '@/lib/editorial';
import { formatPrice } from '@/lib/utils';
import type { CartItem } from '@/types';
import type { ShippingFormData } from '@/lib/validations/checkout';

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Cash on Delivery',
  esewa: 'eSewa',
  khalti: 'Khalti',
  bank_transfer: 'Bank Transfer',
};

interface OrderReviewProps {
  items: CartItem[];
  shipping: ShippingFormData;
  paymentMethod: string;
  notes?: string;
  onEditShipping: () => void;
  onEditPayment: () => void;
}

export function OrderReview({
  items,
  shipping,
  paymentMethod,
  notes,
  onEditShipping,
  onEditPayment,
}: OrderReviewProps) {
  return (
    <div className="space-y-6">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-slate-900 text-sm font-semibold text-white">
          3
        </div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">Review your order</h2>
      </div>

      {/* Shipping Summary */}
      <div className="storefront-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MapPin className="size-4 text-[#7c8fb5]" />
            Shipping To
          </div>
          <Button variant="ghost" size="sm" onClick={onEditShipping} className="text-xs text-slate-500 hover:bg-black/[0.03] hover:text-slate-900">
            <Pencil className="size-3" />
            Edit
          </Button>
        </div>
        <div className="space-y-0.5 pl-6 text-sm text-slate-500">
          <p className="font-medium text-slate-900">{shipping.fullName}</p>
          <p>{shipping.street}</p>
          <p>
            {shipping.city}, {shipping.state} {shipping.postalCode}
          </p>
          <p>{shipping.country}</p>
          <p className="mt-1">{shipping.phone}</p>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="storefront-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CreditCard className="size-4 text-[#7c8fb5]" />
            Payment Method
          </div>
          <Button variant="ghost" size="sm" onClick={onEditPayment} className="text-xs text-slate-500 hover:bg-black/[0.03] hover:text-slate-900">
            <Pencil className="size-3" />
            Edit
          </Button>
        </div>
        <div className="pl-6">
          <Badge variant="secondary" className="border-black/8 bg-white/82 text-slate-700">
            {PAYMENT_LABELS[paymentMethod] || paymentMethod}
          </Badge>
        </div>
      </div>

      {/* Items */}
      <div className="storefront-card">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          Items ({items.reduce((sum, i) => sum + i.quantity, 0)})
        </h3>
        <div className="space-y-3">
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
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-slate-900">
                  {item.product.name}
                </p>
                <p className="text-xs text-slate-500">
                  Qty: {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <p className="whitespace-nowrap text-sm font-semibold text-slate-900">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="storefront-card">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Order Notes</h3>
          <p className="text-sm text-slate-500">{notes}</p>
        </div>
      )}
    </div>
  );
}
