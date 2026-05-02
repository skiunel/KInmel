'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ArrowLeft,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Database,
  FileText,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Chip } from '@/components/ui/chip';
import { Container } from '@/components/layout';
import { PageLoader } from '@/components/shared';
import { cn, formatPrice } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useReviewEligibility, useCreateReview } from '@/hooks/use-reviews';
import { useOrder } from '@/hooks/use-orders';

// ─── Star Rating Input ───

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="group relative rounded-lg p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Star
              className={cn(
                'size-8 transition-colors',
                star <= active
                  ? 'fill-verified text-verified'
                  : 'text-muted-foreground/30 group-hover:text-verified/50'
              )}
            />
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {active > 0 && (
          <motion.p
            key={active}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm font-medium text-foreground"
          >
            {RATING_LABELS[active]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ───

export default function WriteReviewPage({
  params,
}: {
  params: Promise<{ id: string; productId: string }>;
}) {
  const { id: orderId, productId } = use(params);
  const { data: order, isLoading: orderLoading } = useOrder(orderId);
  const {
    data: eligibility,
    isLoading: eligLoading,
    error: eligError,
  } = useReviewEligibility(orderId);
  const createReview = useCreateReview();

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isLoading = orderLoading || eligLoading;

  if (isLoading) {
    return <PageLoader text="Checking eligibility..." />;
  }

  const item = eligibility?.find((e) => e.productId === productId);

  if (eligError || !item) {
    return (
      <Container size="narrow" className="py-20 text-center">
        <AlertCircle className="mx-auto size-12 text-destructive" />
        <h1 className="mt-4 text-xl font-bold">Unable to verify eligibility</h1>
        <Button className="mt-6" render={<Link href={ROUTES.orders} />}>
          Back to Orders
        </Button>
      </Container>
    );
  }

  if (!item.eligible) {
    return (
      <Container size="narrow" className="py-20">
        <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 text-center">
          {item.existingReview ? (
            <>
              <CheckCircle2 className="mx-auto size-12 text-success" />
              <h1 className="mt-4 text-xl font-bold">Already Reviewed</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                You gave this product{' '}
                <span className="font-semibold text-foreground">
                  {item.existingReview.rating}/5
                </span>{' '}
                stars: &ldquo;{item.existingReview.title}&rdquo;
              </p>
            </>
          ) : (
            <>
              <AlertCircle className="mx-auto size-12 text-amber-500" />
              <h1 className="mt-4 text-xl font-bold">Not Eligible</h1>
              <p className="mt-2 text-sm text-muted-foreground">{item.reason}</p>
            </>
          )}
          <Button
            className="mt-6"
            variant="outline"
            render={<Link href={ROUTES.order(orderId)} />}
          >
            Back to Order
          </Button>
        </div>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container size="narrow" className="py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-lg rounded-2xl border-2 border-chain/30 bg-card p-10 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-chain/10">
            <Shield className="size-8 text-chain" />
          </div>
          <h1 className="mt-5 text-2xl font-bold font-heading">
            Review Submitted!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your review is now stored in Kinmel. If the proof services are available,
            the system will attach the IPFS record and blockchain anchor automatically.
          </p>
          <div className="mt-6 flex flex-col gap-3 rounded-xl bg-muted/50 p-4 text-left text-xs">
            <div className="flex items-center gap-2">
              <Database className="size-3.5 text-chain" />
              <span className="text-muted-foreground">IPFS Storage</span>
              <span className="ml-auto font-medium text-success">Queued</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="size-3.5 text-chain" />
              <span className="text-muted-foreground">Content fingerprint</span>
              <span className="ml-auto font-medium text-success">Generated</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="size-3.5 text-chain" />
              <span className="text-muted-foreground">Chain anchor</span>
              <span className="ml-auto font-medium text-amber-600">Pending</span>
            </div>
          </div>
          <div className="mt-6 flex gap-3 justify-center">
            <Button variant="outline" render={<Link href={ROUTES.order(orderId)} />}>
              View Order
            </Button>
            <Button render={<Link href={ROUTES.orders} />}>My Orders</Button>
          </div>
        </motion.div>
      </Container>
    );
  }

  const isValid =
    rating >= 1 && title.trim().length >= 3 && content.trim().length >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    await createReview.mutateAsync({
      orderId,
      productId,
      rating,
      title: title.trim(),
      content: content.trim(),
    });
    setSubmitted(true);
  }

  const orderItem = order?.items.find((i) => i.product === productId);

  return (
    <Container size="narrow" className="py-10">
      <div className="mx-auto max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          render={<Link href={ROUTES.order(orderId)} />}
        >
          <ArrowLeft className="size-4" />
          Back to Order
        </Button>

        {orderItem && (
          <div className="mb-8 flex items-center gap-4 rounded-xl border bg-card p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  N/A
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate">
                {item.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatPrice(orderItem.price)} × {orderItem.quantity}
              </p>
            </div>
            <Chip variant="chain">
              <Shield className="size-3" />
              Verified Purchase
            </Chip>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="border-b bg-gradient-to-r from-chain/5 to-transparent px-6 py-5">
              <h1 className="text-xl font-bold font-heading flex items-center gap-2">
                <Shield className="size-5 text-chain" />
                Write a Verified Review
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Your review is saved in Kinmel first, then linked to external proof
                records when IPFS and blockchain services are available.
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <label className="text-sm font-semibold text-foreground block mb-3">
                  Overall Rating
                </label>
                <StarRating value={rating} onChange={setRating} />
                {rating === 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Click a star to rate
                  </p>
                )}
              </div>

              <Separator />

              <div>
                <label
                  htmlFor="review-title"
                  className="text-sm font-semibold text-foreground block mb-1.5"
                >
                  Review Title
                </label>
                <Input
                  id="review-title"
                  placeholder="Summarize your experience"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                />
                <p className="mt-1 text-xs text-muted-foreground text-right">
                  {title.length}/120
                </p>
              </div>

              <div>
                <label
                  htmlFor="review-content"
                  className="text-sm font-semibold text-foreground block mb-1.5"
                >
                  Your Review
                </label>
                <Textarea
                  id="review-content"
                  placeholder="Share your detailed experience with this product..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  maxLength={2000}
                />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>
                    {content.length < 10
                      ? `${10 - content.length} more characters needed`
                      : 'Looks good!'}
                  </span>
                  <span>{content.length}/2000</span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-chain/5 border border-chain/15 p-4">
                <Database className="size-5 text-chain shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground text-sm">
                    Proof flow
                  </p>
                  <p>
                    When you submit, Kinmel stores the review, creates a SHA-256
                    fingerprint, and then tries to publish proof records to IPFS
                    and the configured blockchain network.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t bg-muted/30 px-6 py-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                By submitting, you confirm this is an honest review.
              </p>
              <Button
                type="submit"
                disabled={!isValid || createReview.isPending}
                className="min-w-[160px]"
              >
                {createReview.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Storing on IPFS...
                  </>
                ) : (
                  <>
                    <Shield className="size-4" />
                    Publish review
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Container>
  );
}
