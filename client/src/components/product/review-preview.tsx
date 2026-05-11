'use client';

import { useState } from 'react';
import { Star, Shield } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ReviewCard } from '@/components/review/review-card';
import { Pagination } from '@/components/shared/pagination';
import { cn } from '@/lib/utils';
import { useProductReviews } from '@/hooks/use-reviews';

interface ReviewPreviewProps {
  productId: string;
  averageRating: number;
  reviewCount: number;
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
];

export function ReviewPreview({
  productId,
  averageRating,
  reviewCount,
  className,
}: ReviewPreviewProps) {
  const [sort, setSort] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>(
    'newest'
  );
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProductReviews(productId, {
    page,
    limit: 5,
    sort,
  });

  const reviews = data?.data || [];
  const ratingBreakdown = data?.ratingBreakdown || {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  const pagination = data?.pagination;
  const totalReviews = pagination?.total ?? reviewCount;

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground font-heading">
            Customer Reviews
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Open any review&apos;s proof page to independently inspect buyer, storage, and blockchain checks.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-chain/10 px-3 py-1 text-xs font-medium text-chain">
          <Shield className="size-3" />
          Public Proof
        </div>
      </div>

      {/* Summary + breakdown */}
      <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-white/8 bg-muted/30 p-8 text-center sm:flex-row sm:text-left">
        {/* Average rating */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-5xl font-bold text-foreground">
            {averageRating.toFixed(1)}
          </span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'size-5',
                  i < Math.round(averageRating)
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground/30'
                )}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </p>
        </div>

        <Separator orientation="vertical" className="hidden h-20 sm:block" />
        <Separator className="sm:hidden" />

        {/* Rating breakdown */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingBreakdown[star] || 0;
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="w-8 text-right text-sm text-muted-foreground">
                  {star}★
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/70 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-xs text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sort + reviews list */}
      {totalReviews > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {reviews.length} of {totalReviews} reviews
            </p>
            <Select
              value={sort}
              onValueChange={(v) => {
                if (v) {
                  setSort(v as typeof sort);
                  setPage(1);
                }
              }}
            >
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-xl bg-muted/50"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <Pagination pagination={pagination} onPageChange={setPage} />
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <Star className="mx-auto size-10 text-muted-foreground/30" />
          <h3 className="mt-4 font-semibold text-foreground">No reviews yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to leave a verified review for this product.
          </p>
        </div>
      )}
    </div>
  );
}
