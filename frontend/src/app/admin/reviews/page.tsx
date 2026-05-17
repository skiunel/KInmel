'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Star,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Flag,
  FlagOff,
  Trash2,
  ArrowUpDown,
  Database,
  Eye,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Chip } from '@/components/ui/chip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatCard } from '@/components/admin';
import { Pagination } from '@/components/shared/pagination';
import { cn, timeAgo, truncateHash } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import {
  useAdminReviews,
  useFlagReview,
  useDeleteReview,
} from '@/hooks/use-admin';
import type { Review, VerificationStatus } from '@/types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest', label: 'Lowest Rating' },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Reviews' },
  { value: 'true', label: 'Flagged Only' },
  { value: 'false', label: 'Unflagged Only' },
];

const STATUS_CONFIG: Record<
  VerificationStatus,
  { label: string; variant: 'chain' | 'verified' | 'muted' | 'warning'; icon: typeof Shield }
> = {
  verified: { label: 'Blockchain', variant: 'chain', icon: ShieldCheck },
  stored: { label: 'IPFS', variant: 'verified', icon: Database },
  pending: { label: 'Pending', variant: 'muted', icon: Shield },
  failed: { label: 'Failed', variant: 'warning', icon: ShieldAlert },
};

export default function AdminReviewsPage() {
  const [sort, setSort] = useState('newest');
  const [flagged, setFlagged] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminReviews({
    page,
    limit: 15,
    sort,
    flagged: flagged === 'all' ? undefined : flagged,
  });

  const reviews = data?.data || [];
  const pagination = data?.pagination;

  const verifiedCount = reviews.filter(
    (r) => r.verificationStatus === 'verified'
  ).length;
  const flaggedCount = reviews.filter((r) => r.isFlagged).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-heading">
          Review Monitoring
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor, flag, and manage customer reviews with verification status
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Reviews"
          value={pagination?.total ?? '—'}
          icon={MessageSquare}
        />
        <StatCard
          label="Signed by buyer"
          value={verifiedCount}
          icon={ShieldCheck}
          variant="chain"
        />
        <StatCard
          label="Flagged"
          value={flaggedCount}
          icon={Flag}
          variant="verified"
        />
        <StatCard
          label="Avg Rating"
          value={
            reviews.length > 0
              ? (
                  reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
                ).toFixed(1)
              : '—'
          }
          icon={Star}
          variant="success"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={flagged} onValueChange={(v) => { if (v) { setFlagged(v); setPage(1); } }}>
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <Flag className="size-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => v && setSort(v)}>
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <ArrowUpDown className="size-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center">
          <MessageSquare className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No reviews found</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${sort}-${flagged}-${page}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {reviews.map((review) => (
              <AdminReviewCard key={review._id} review={review} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {pagination && pagination.pages > 1 && (
        <Pagination pagination={pagination} onPageChange={setPage} />
      )}
    </div>
  );
}

function AdminReviewCard({ review }: { review: Review }) {
  const flagReview = useFlagReview();
  const deleteReview = useDeleteReview();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const status = STATUS_CONFIG[review.verificationStatus];
  const StatusIcon = status.icon;

  const userName =
    typeof review.user === 'object' ? review.user.name : 'Anonymous';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const productName =
    typeof review.product === 'object' ? review.product.name : '—';
  const productSlug =
    typeof review.product === 'object' ? review.product.slug : '';

  return (
    <motion.div
      layout
      className={cn(
        'rounded-xl border bg-card p-5 transition-colors',
        review.isFlagged && 'border-destructive/30 bg-destructive/[0.02]'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{userName}</p>
              {review.isFlagged && (
                <Chip variant="destructive" className="text-[10px]">
                  <Flag className="size-2.5" />
                  Flagged
                </Chip>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              on{' '}
              <span className="font-medium text-foreground">{productName}</span>
              {' · '}
              {timeAgo(review.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Chip variant={status.variant} className="text-[10px]">
            <StatusIcon className="size-2.5" />
            {status.label}
          </Chip>
        </div>
      </div>

      {/* Stars + content */}
      <div className="mt-3 flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'size-3.5',
              i < review.rating
                ? 'fill-verified text-verified'
                : 'text-muted-foreground/30'
            )}
          />
        ))}
        <span className="ml-2 text-xs text-muted-foreground">
          {review.rating}/5
        </span>
      </div>

      <h4 className="mt-2 text-sm font-semibold">{review.title}</h4>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
        {review.content}
      </p>

      {/* IPFS / Chain info */}
      {(review.ipfsHash || review.blockchainTxHash) && (
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-mono">
          {review.ipfsHash && (
            <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">
              IPFS: {truncateHash(review.ipfsHash, 8, 4)}
            </span>
          )}
          {review.blockchainTxHash && (
            <span className="rounded bg-chain/5 px-2 py-0.5 text-chain">
              TX: {truncateHash(review.blockchainTxHash, 8, 4)}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 border-t pt-3">
        {productSlug && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            render={<Link href={ROUTES.verify(review._id)} />}
          >
            <Eye className="size-3" />
            Verify
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() =>
            flagReview.mutate({
              id: review._id,
              isFlagged: !review.isFlagged,
              flagReason: review.isFlagged ? undefined : 'Admin flagged',
            })
          }
          disabled={flagReview.isPending}
        >
          {review.isFlagged ? (
            <>
              <FlagOff className="size-3" />
              Unflag
            </>
          ) : (
            <>
              <Flag className="size-3" />
              Flag
            </>
          )}
        </Button>

        {confirmDelete ? (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-xs text-destructive font-medium">
              Confirm?
            </span>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs h-7"
              onClick={() => deleteReview.mutate(review._id)}
              disabled={deleteReview.isPending}
            >
              {deleteReview.isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                'Delete'
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-destructive ml-auto"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-3" />
            Delete
          </Button>
        )}
      </div>
    </motion.div>
  );
}
