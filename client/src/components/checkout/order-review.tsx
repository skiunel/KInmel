'use client';

import Image from 'next/image';
import { MapPin, CreditCard, Pencil } from 'lucide-react';
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

export function OrderReview({ items, shipping, paymentMethod, notes, onEditShipping, onEditPayment }: OrderReviewProps) {
  return (
    <div className="space-y-5">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-none bg-[#E63946] text-sm font-bold text-[#0A0A0A]">
          3
        </div>
        <h2 className="font-heading text-2xl font-bold text-[#0A0A0A]">Review your order</h2>
      </div>

      <div className="border border-[#0A0A0A]/10 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0A0A0A]">
            <MapPin className="size-4 text-[#E63946]" />
            Shipping To
          </div>
          <button onClick={onEditShipping} className="inline-flex items-center gap-1 text-xs text-[#0A0A0A]/40 hover:text-[#0A0A0A] transition-colors">
            <Pencil className="size-3" />
            Edit
          </button>
        </div>
        <div className="space-y-0.5 pl-6 text-sm text-[#0A0A0A]/50">
          <p className="font-medium text-[#0A0A0A]">{shipping.fullName}</p>
          <p>{shipping.street}</p>
          <p>{shipping.city}, {shipping.state} {shipping.postalCode}</p>
          <p>{shipping.country}</p>
          <p className="mt-1">{shipping.phone}</p>
        </div>
      </div>

      <div className="border border-[#0A0A0A]/10 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0A0A0A]">
            <CreditCard className="size-4 text-[#E63946]" />
            Payment Method
          </div>
          <button onClick={onEditPayment} className="inline-flex items-center gap-1 text-xs text-[#0A0A0A]/40 hover:text-[#0A0A0A] transition-colors">
            <Pencil className="size-3" />
            Edit
          </button>
        </div>
        <div className="pl-6">
          <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-semibold border border-[#E63946]/30 bg-[#E63946]/10 text-[#E63946]">
            {PAYMENT_LABELS[paymentMethod] || paymentMethod}
          </span>
        </div>
      </div>

      <div className="border border-[#0A0A0A]/10 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-[#0A0A0A]">
          Items ({items.reduce((sum, i) => sum + i.quantity, 0)})
        </h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.product._id} className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-none bg-[#E63946]/10 border border-[#0A0A0A]/10">
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
                <p className="line-clamp-1 text-sm font-medium text-[#0A0A0A]">{item.product.name}</p>
                <p className="text-xs text-[#0A0A0A]/40">Qty: {item.quantity} × {formatPrice(item.price)}</p>
              </div>
              <p className="whitespace-nowrap text-sm font-semibold text-[#E63946]">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {notes && (
        <div className="border border-[#0A0A0A]/10 bg-white p-5">
          <h3 className="mb-2 text-sm font-semibold text-[#0A0A0A]">Order Notes</h3>
          <p className="text-sm text-[#0A0A0A]/50">{notes}</p>
        </div>
      )}
    </div>
  );
}
