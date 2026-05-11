'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
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
    try { await updateItem(product._id, qty); } catch { /* store handles toast */ }
    setLoading(null);
  }

  async function handleRemove() {
    setLoading('remove');
    try { await removeItem(product._id); } catch { /* store handles toast */ }
    setLoading(null);
  }

  return (
    <div className="flex gap-3">
      <Link
        href={ROUTES.product(product.slug)}
        className="relative shrink-0 overflow-hidden rounded-xl bg-white/[0.04] border border-white/10"
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

      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <Link
            href={ROUTES.product(product.slug)}
            className="line-clamp-1 text-sm font-medium text-white hover:text-[#6C63FF] transition-colors"
          >
            {product.name}
          </Link>
          <p className="mt-0.5 text-sm font-semibold text-[#6C63FF]">
            {formatPrice(item.price)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm">
            <button
              onClick={() => handleQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1 || loading !== null}
              className="flex h-8 w-8 items-center justify-center text-white/50 hover:text-white transition-colors disabled:opacity-40"
            >
              <Minus className="size-3" />
            </button>
            <span className="flex h-8 w-9 items-center justify-center border-x border-white/10 text-xs font-medium text-white">
              {loading === 'update' ? <Loader2 className="size-3 animate-spin" /> : item.quantity}
            </span>
            <button
              onClick={() => handleQuantity(item.quantity + 1)}
              disabled={item.quantity >= maxQty || loading !== null}
              className="flex h-8 w-8 items-center justify-center text-white/50 hover:text-white transition-colors disabled:opacity-40"
            >
              <Plus className="size-3" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={loading !== null}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/30 hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10 transition-all disabled:opacity-40"
          >
            {loading === 'remove' ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
