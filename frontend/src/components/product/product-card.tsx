'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { cn, formatPrice, getDiscountPercentage } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Omit<Product, 'category'> & {
    category?: Product['category'] | { name: string };
    totalReviews?: number;
    verifiedPercent?: number;
  };
  onAddToCart?: (productId: string) => void;
  className?: string;
}

export function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  const discount = getDiscountPercentage(product.price, product.compareAtPrice || 0);
  const isOutOfStock = product.stock === 0;
  const reviewTotal = product.totalReviews ?? product.reviewCount ?? 0;
  const categoryName =
    product.category && typeof product.category === 'object' ? product.category.name : undefined;
  const imgA = product.images?.[0];
  const imgB = product.images?.[1] ?? imgA;

  return (
    <Link href={`${ROUTES.products}/${product.slug}`} className={cn('group block', className)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F4F4F4]">
        {imgA ? (
          <>
            <Image
              src={imgA}
              alt={product.name}
              fill
              unoptimized
              className="object-cover transition-opacity duration-500 group-hover:opacity-0"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <Image
              src={imgB}
              alt={product.name}
              fill
              unoptimized
              className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-sans font-black text-7xl text-[#0A0A0A]/10">◆</span>
          </div>
        )}

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between font-mono text-[9px] uppercase tracking-[0.2em]">
          {discount > 0 ? (
            <span className="bg-[#E63946] text-white px-2 py-1">−{discount}%</span>
          ) : isOutOfStock ? (
            <span className="bg-[#0A0A0A] text-white px-2 py-1">Sold out</span>
          ) : (
            <span className="bg-white/90 px-2 py-1 text-[#0A0A0A]">◆ {reviewTotal} signed</span>
          )}
          {!isOutOfStock && onAddToCart && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product._id);
              }}
              className="bg-white/90 size-7 inline-flex items-center justify-center text-[#0A0A0A] hover:bg-[#E63946] hover:text-white transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Add to bag"
            >
              <ShoppingBag className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#0A0A0A]/45 mb-1">
          {categoryName || 'Object'}
        </p>
        <h3 className="font-sans text-sm font-semibold uppercase tracking-[-0.01em] text-[#0A0A0A] leading-snug line-clamp-2 group-hover:text-[#E63946] transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 font-mono text-[12px] text-[#0A0A0A]/75">
          {formatPrice(product.price)}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="ml-2 line-through text-[#0A0A0A]/35">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
