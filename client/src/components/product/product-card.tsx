'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import { cn, formatPrice, getDiscountPercentage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Omit<Product, 'category'> & {
    category?: Product['category'] | { name: string };
    totalReviews?: number;
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

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn('group h-full', className)}
    >
      <Link href={`${ROUTES.products}/${product.slug}`} className="block h-full">
        <div className="flex h-full flex-col overflow-hidden rounded-[2.15rem] border border-white/8 bg-card/95 shadow-[0_18px_44px_rgba(0,0,0,0.28)] transition-all duration-300 group-hover:shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-b-[1.7rem] bg-[#151519]">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image
              </div>
            )}

            {/* Badges */}
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {discount > 0 && (
                <Badge className="bg-primary text-primary-foreground shadow-sm">
                  -{discount}%
                </Badge>
              )}
              {isOutOfStock && (
                <Badge variant="secondary" className="bg-black/70 shadow-sm">
                  Out of stock
                </Badge>
              )}
            </div>

            {!isOutOfStock && onAddToCart && (
              <div className="absolute bottom-4 right-4 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onAddToCart(product._id);
                  }}
                  className="rounded-full shadow-lg"
                >
                  <ShoppingCart className="size-4" />
                  Add
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col p-5">
            {categoryName && (
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {categoryName}
              </p>
            )}
            <h3 className="mt-2 line-clamp-2 text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {product.name}
            </h3>

            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 text-verified">
                  <Star className="size-3.5 fill-current" />
                  <span className="font-medium text-foreground">
                    {product.averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-muted-foreground">({reviewTotal})</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {isOutOfStock ? 'Unavailable' : `${product.stock} in stock`}
              </span>
            </div>

            <div className="mt-auto flex items-end justify-between gap-3 pt-5">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold tracking-tight text-foreground">
                {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              {!onAddToCart && (
                <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                  View
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
