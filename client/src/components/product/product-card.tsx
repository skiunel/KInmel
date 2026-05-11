'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, ArrowUpRight } from 'lucide-react';
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
  const imageSrc = product.images?.[0];

  return (
    <Link href={`${ROUTES.products}/${product.slug}`} className={cn('group block', className)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-[#0F0F12] border border-[#EDE7DA]/8">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            unoptimized
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[900ms] group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading text-7xl text-[#EDE7DA]/8">◆</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D]/70 via-transparent to-transparent" />

        {/* Top meta */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-[#EDE7DA]/80">
          {discount > 0 ? (
            <span className="text-[#FF3D00]">◆ −{discount}%</span>
          ) : isOutOfStock ? (
            <span className="text-[#EDE7DA]/55">Sold out</span>
          ) : (
            <span>◆ {String(reviewTotal).padStart(2, '0')} signed</span>
          )}
          <span className="text-[#EDE7DA]/55">{categoryName || 'Object'}</span>
        </div>

        {/* Hover arrow */}
        <div className="absolute top-4 right-4 mt-12 size-9 hidden md:inline-flex items-center justify-center border border-[#EDE7DA]/0 group-hover:border-[#FF3D00] group-hover:bg-[#FF3D00] group-hover:text-[#0B0B0D] text-[#EDE7DA] opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          <ArrowUpRight className="size-4" />
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-black uppercase tracking-tight text-[#EDE7DA] leading-tight line-clamp-2 group-hover:text-[#FF3D00] transition-colors">
            {product.name}
          </h3>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#EDE7DA]/65">
            {formatPrice(product.price)}
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="ml-2 line-through text-[#EDE7DA]/30">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </p>
        </div>
        {!isOutOfStock && onAddToCart && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product._id);
            }}
            className="shrink-0 size-9 inline-flex items-center justify-center border border-[#EDE7DA]/15 text-[#EDE7DA]/65 hover:border-[#FF3D00] hover:text-[#FF3D00] transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingCart className="size-4" />
          </button>
        )}
      </div>
    </Link>
  );
}
