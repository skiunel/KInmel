'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Shield,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn, formatPrice, getDiscountPercentage } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import type { Product, Category } from '@/types';

interface ProductInfoProps {
  product: Product;
  onAddToCart?: (productId: string, quantity: number) => void;
}

export function ProductInfo({ product, onAddToCart }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const discount = getDiscountPercentage(product.price, product.compareAtPrice || 0);
  const category = typeof product.category === 'object' ? (product.category as Category) : null;

  return (
    <div className="space-y-6">
      {/* Category & Tags */}
      <div className="flex flex-wrap items-center gap-2">
        {category && (
          <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">
            {category.name}
          </Badge>
        )}
        {product.isFeatured && (
        <Badge className="border-primary/20 bg-primary/10 text-primary">
          <Star className="size-3 fill-current" />
          Featured
        </Badge>
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl font-heading">
        {product.name}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'size-4',
                i < Math.round(product.averageRating)
                  ? 'fill-verified text-verified'
                  : 'text-muted-foreground/30'
              )}
            />
          ))}
        </div>
        <span className="text-sm font-medium">{product.averageRating.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">
          ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
        </span>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-foreground">
          {formatPrice(product.price)}
        </span>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
            <Badge className="bg-primary text-primary-foreground">
              Save {discount}%
            </Badge>
          </>
        )}
      </div>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="text-muted-foreground leading-relaxed">{product.shortDescription}</p>
      )}

      <Separator />

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        {isOutOfStock ? (
          <>
            <AlertCircle className="size-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Out of stock</span>
          </>
        ) : isLowStock ? (
          <>
            <AlertCircle className="size-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Only {product.stock} left in stock
            </span>
          </>
        ) : (
          <>
            <Check className="size-4 text-primary" />
            <span className="text-sm font-medium text-primary">In stock</span>
          </>
        )}
      </div>

      {/* Quantity & Add to Cart */}
      {!isOutOfStock && (
        <div className="flex items-center gap-4">
          {/* Quantity selector */}
          <div className="flex items-center rounded-[1rem] border border-border bg-white/[0.03]">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <span className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-medium">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={quantity >= product.stock}
              className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
          </div>

          {/* Add to cart button */}
          <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
            <Button
              size="lg"
              className="w-full h-11 text-sm font-semibold"
              onClick={() => onAddToCart?.(product._id, quantity)}
            >
              <ShoppingCart className="size-4" />
              Add to Cart — {formatPrice(product.price * quantity)}
            </Button>
          </motion.div>
        </div>
      )}

      <Separator />

      {/* Trust signals */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-[1rem] bg-muted/50 px-4 py-3">
          <Truck className="size-5 text-primary" />
          <div>
            <p className="text-xs font-semibold text-foreground">Free Shipping</p>
            <p className="text-[11px] text-muted-foreground">
              Over Rs. {FREE_SHIPPING_THRESHOLD.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[1rem] bg-muted/50 px-4 py-3">
          <Shield className="size-5 text-chain" />
          <div>
            <p className="text-xs font-semibold text-foreground">Verified Reviews</p>
            <p className="text-[11px] text-muted-foreground">Blockchain proven</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[1rem] bg-muted/50 px-4 py-3">
          <RotateCcw className="size-5 text-primary" />
          <div>
            <p className="text-xs font-semibold text-foreground">Easy Returns</p>
            <p className="text-[11px] text-muted-foreground">7-day return policy</p>
          </div>
        </div>
      </div>

      {/* SKU */}
      <p className="text-xs text-muted-foreground">
        SKU: <span className="font-mono">{product.sku}</span>
      </p>
    </div>
  );
}
