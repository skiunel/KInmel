'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getEditorialImage } from '@/lib/editorial';
import { formatPrice } from '@/lib/utils';
import { ROUTES, MAX_CART_ITEM_QUANTITY } from '@/lib/constants';
import { useCartStore } from '@/stores/cart-store';
import type { CartItem } from '@/types';

interface CartItemRowProps {
  item: CartItem;
  compact?: boolean;
}

export function CartItemRow({ item, compact }: CartItemRowProps) {
  const { updateItem, removeItem } = useCartStore();
  const [loading, setLoading] = useState<'update' | 'remove' | null>(null);

  const product = item.product;
  const maxQty = Math.min(product.stock, MAX_CART_ITEM_QUANTITY);

  async function handleQuantity(qty: number) {
    setLoading('update');
    try {
      await updateItem(product._id, qty);
    } catch { /* toast handled at store level */ }
    setLoading(null);
  }

  async function handleRemove() {
    setLoading('remove');
    try {
      await removeItem(product._id);
    } catch { /* toast handled at store level */ }
    setLoading(null);
  }

  return (
    <div className="flex gap-3">
      {/* Image */}
      <Link
        href={ROUTES.product(product.slug)}
        className="relative shrink-0 overflow-hidden rounded-lg bg-muted"
        style={{ width: compact ? 64 : 80, height: compact ? 64 : 80 }}
      >
        <Image
          src={product.images[0] || getEditorialImage(product, 0)}
          alt={product.name}
          fill
          unoptimized
          className="object-cover"
          sizes={compact ? '64px' : '80px'}
        />
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <Link
            href={ROUTES.product(product.slug)}
            className="line-clamp-1 text-sm font-medium text-slate-900 transition-colors hover:text-slate-700"
          >
            {product.name}
          </Link>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">
            {formatPrice(item.price)}
          </p>
        </div>

        {/* Quantity + Remove */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center rounded-full border border-black/8 bg-white/76">
            <button
              onClick={() => handleQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1 || loading !== null}
              className="flex h-8 w-8 items-center justify-center text-slate-500 transition-colors hover:text-slate-900 disabled:opacity-40"
            >
              <Minus className="size-3" />
            </button>
            <span className="flex h-8 w-9 items-center justify-center border-x border-black/8 text-xs font-medium text-slate-900">
              {loading === 'update' ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              onClick={() => handleQuantity(item.quantity + 1)}
              disabled={item.quantity >= maxQty || loading !== null}
              className="flex h-8 w-8 items-center justify-center text-slate-500 transition-colors hover:text-slate-900 disabled:opacity-40"
            >
              <Plus className="size-3" />
            </button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-slate-500 hover:bg-black/[0.03] hover:text-red-500"
            onClick={handleRemove}
            disabled={loading !== null}
          >
            {loading === 'remove' ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
