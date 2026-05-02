'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ShoppingCart } from 'lucide-react';
import { cn, formatPrice, getDiscountPercentage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

interface ProductListCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    shortDescription?: string;
    price: number;
    compareAtPrice?: number | null;
    images: string[];
    averageRating: number;
    reviewCount: number;
    stock: number;
    category?: { name: string };
  };
  onAddToCart?: (productId: string) => void;
  className?: string;
}

export function ProductListCard({ product, onAddToCart, className }: ProductListCardProps) {
  const discount = getDiscountPercentage(product.price, product.compareAtPrice || 0);
  const isOutOfStock = product.stock === 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn('group', className)}
    >
      <Link href={`${ROUTES.products}/${product.slug}`} className="block">
        <div className="flex gap-4 rounded-[1.8rem] border border-white/8 bg-card p-4 transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-primary/10 sm:gap-6">
          {/* Image */}
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-[1.2rem] bg-muted sm:h-40 sm:w-40">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="160px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No image
              </div>
            )}
            {discount > 0 && (
              <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground shadow-sm">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              {product.category && (
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {product.category.name}
                </p>
              )}
              <h3 className="mt-1 font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              {product.shortDescription && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {product.shortDescription}
                </p>
              )}

              {/* Rating */}
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  <Star className="size-3.5 fill-verified text-verified" />
                  <span className="text-sm font-medium">{product.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
                </span>
              </div>
            </div>

            {/* Bottom row */}
            <div className="mt-3 flex items-end justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              {!isOutOfStock && onAddToCart ? (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onAddToCart(product._id);
                  }}
                  className="shadow-sm"
                >
                  <ShoppingCart className="size-3.5" />
                  Add to cart
                </Button>
              ) : isOutOfStock ? (
                <Badge variant="secondary">Out of stock</Badge>
              ) : null}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
