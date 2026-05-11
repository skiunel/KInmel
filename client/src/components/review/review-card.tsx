'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Star,
  Shield,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { cn, timeAgo, truncateHash } from '@/lib/utils';
import { Chip } from '@/components/ui/chip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import type { Review, VerificationStatus } from '@/types';

const statusConfig: Record<
  VerificationStatus,
  { label: string; variant: 'chain' | 'verified' | 'muted' | 'warning' }
> = {
  verified: { label: 'Signed by buyer', variant: 'chain' },
  stored: { label: 'IPFS Stored', variant: 'verified' },
  pending: { label: 'Pending Verification', variant: 'muted' },
  failed: { label: 'Verification Failed', variant: 'warning' },
};

interface ReviewCardProps {
  review: Review;
  className?: string;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  const [copied, setCopied] = useState(false);
  const status = statusConfig[review.verificationStatus];
  const userName =
    typeof review.user === 'object' ? review.user.name : 'Anonymous';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const verificationUrl = ROUTES.verify(review._id);

  function handleCopyVerificationLink() {
    navigator.clipboard.writeText(window.location.origin + verificationUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass-card p-5 transition-all hover:border-[#FFD700]/40 hover:shadow-[0_8px_32px_rgba(255,215,0,0.15)]',
        className
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
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-foreground">{userName}</p>
              <CheckCircle2 className="size-3.5 text-success" />
            </div>
            <p className="text-xs text-muted-foreground">
              {timeAgo(review.createdAt)} · Verified Buyer
            </p>
          </div>
        </div>
        <Chip variant={status.variant} className="shrink-0">
          <Shield className="size-3" />
          {status.label}
        </Chip>
      </div>

      {/* Stars */}
      <div className="mt-3 flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'size-4',
              i < review.rating
                ? 'fill-verified text-verified'
                : 'text-muted-foreground/30'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <h4 className="mt-3 font-semibold text-foreground">{review.title}</h4>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
        {review.content}
      </p>

      {/* IPFS / Blockchain proof */}
      {(review.ipfsHash || review.blockchainTxHash) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {review.ipfsHash && (
            <div className="flex items-center gap-1.5 rounded-lg bg-verified/5 px-2.5 py-1.5 text-xs font-mono text-muted-foreground">
              <Shield className="size-3 text-verified" />
              IPFS: {truncateHash(review.ipfsHash, 8, 4)}
            </div>
          )}
          {review.blockchainTxHash && (
            <div className="flex items-center gap-1.5 rounded-lg bg-chain/5 px-2.5 py-1.5 text-xs font-mono text-muted-foreground">
              <Shield className="size-3 text-chain" />
              TX: {truncateHash(review.blockchainTxHash)}
              <ExternalLink className="size-3" />
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
        <Button
          size="sm"
          variant="outline"
          render={<Link href={verificationUrl} />}
        >
          <Shield className="size-3.5" />
          Verify This Review
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopyVerificationLink}
        >
          {copied ? (
            <Check className="size-3.5 text-success" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? 'Verification Link Copied' : 'Copy Verification Link'}
        </Button>
        <p className="text-xs text-muted-foreground">
          Anyone can open the proof page to inspect buyer, storage, and on-chain checks.
        </p>
      </div>
    </motion.div>
  );
}
