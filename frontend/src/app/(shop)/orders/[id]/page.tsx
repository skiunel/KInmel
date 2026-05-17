'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Calendar,
  Copy,
  Check,
  Star,
  XCircle,
  AlertCircle,
  Truck,
  Package,
  Shield,
  Link2,
} from 'lucide-react';
import { Container, PageHeader } from '@/components/layout';
import { PageLoader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  DeliveryTimeline,
  CancelOrderDialog,
} from '@/components/orders';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useOrder } from '@/hooks/use-orders';
import { useReviewEligibility } from '@/hooks/use-reviews';
import type { OrderStatus } from '@/types';

// ─── Status Progress ───

const PROGRESS_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'pending', label: 'Placed' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'processing', label: 'Processing' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'delivered', label: 'Delivered' },
];

function getProgressIndex(status: OrderStatus): number {
  const idx = PROGRESS_STEPS.findIndex((s) => s.status === status);
  return idx >= 0 ? idx : -1;
}

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Cash on Delivery',
  esewa: 'eSewa',
  khalti: 'Khalti',
  bank_transfer: 'Bank Transfer',
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading, error } = useOrder(id);
  const isDelivered = order?.status === 'delivered';
  const { data: eligibility } = useReviewEligibility(isDelivered ? id : '');
  const [copied, setCopied] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (isLoading) {
    return <PageLoader text="Loading order..." />;
  }

  if (error || !order) {
    return (
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-md text-center">
            <AlertCircle className="mx-auto size-12 text-destructive" />
            <h1 className="mt-4 text-xl font-bold">Order Not Found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This order doesn&apos;t exist or you don&apos;t have access.
            </p>
            <Button className="mt-6" render={<Link href={ROUTES.orders} />}>
              View My Orders
            </Button>
          </div>
        </Container>
      </section>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const progressIndex = getProgressIndex(order.status);
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  function copyOrderNumber() {
    navigator.clipboard.writeText(order!.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <PageHeader
        title={`Order ${order.orderNumber}`}
        breadcrumbs={[
          { label: 'Home', href: ROUTES.home },
          { label: 'My Orders', href: ROUTES.orders },
          { label: order.orderNumber },
        ]}
        className="py-4"
      >
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} size="md" />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </PageHeader>

      <section className="py-8 sm:py-12">
        <Container>
          {/* Status progress bar (non-cancelled orders) */}
          {!isCancelled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 rounded-xl border bg-card p-6"
            >
              <div className="flex items-center justify-between">
                {PROGRESS_STEPS.map((step, i) => {
                  const isCompleted = i <= progressIndex;
                  const isCurrent = i === progressIndex;

                  return (
                    <div key={step.status} className="flex flex-1 items-center">
                      {i > 0 && (
                        <div
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= progressIndex ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      )}
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                            isCurrent
                              ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                              : isCompleted
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="size-4" />
                          ) : (
                            i + 1
                          )}
                        </div>
                        <span
                          className={`text-[11px] font-medium whitespace-nowrap ${
                            isCompleted ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Cancelled banner */}
          {isCancelled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5"
            >
              <XCircle className="size-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Order Cancelled</p>
                {order.cancelReason && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reason: {order.cancelReason}
                  </p>
                )}
                {order.cancelledAt && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Cancelled on {formatDateTime(order.cancelledAt)}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order info bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap items-center gap-4 rounded-xl border bg-card px-5 py-4"
              >
                <div className="flex items-center gap-2">
                  <Package className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Order:</span>
                  <span className="text-sm font-bold font-mono">{order.orderNumber}</span>
                  <button
                    onClick={copyOrderNumber}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? (
                      <Check className="size-3.5 text-success" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
                <Separator orientation="vertical" className="h-5 hidden sm:block" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  Placed {formatDate(order.createdAt)}
                </div>
                {order.estimatedDelivery && !isCancelled && !isDelivered && (
                  <>
                    <Separator orientation="vertical" className="h-5 hidden sm:block" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Truck className="size-4" />
                      Est. {formatDate(order.estimatedDelivery)}
                    </div>
                  </>
                )}
              </motion.div>

              {/* Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border bg-card"
              >
                <div className="px-5 py-4 border-b">
                  <h2 className="text-base font-bold font-heading">
                    Items ({itemCount})
                  </h2>
                </div>
                <div className="divide-y">
                  {order.items.map((item, i) => {
                    return (
                      <div key={i} className="flex items-center gap-4 px-5 py-4">
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

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            SKU: {item.sku} · Qty: {item.quantity}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(item.price)} each
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          {isDelivered && item.product && (() => {
                            const elig = eligibility?.find((e) => e.productId === item.product);
                            if (elig && !elig.eligible && elig.existingReview) {
                              return (
                                <Link
                                  href={ROUTES.verify(elig.existingReview._id)}
                                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-success transition-colors hover:text-success/80"
                                >
                                  <Check className="size-3" />
                                  Review Written · {elig.existingReview.rating}★
                                </Link>
                              );
                            }
                            return (
                              <Link
                                href={ROUTES.writeReview(order._id, item.product)}
                                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                              >
                                <Star className="size-3" />
                                Write Review
                              </Link>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Delivery confirmation code */}
              {isDelivered && order.blockchainCode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                  className="rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="size-5 text-emerald-600" />
                    <h3 className="text-base font-bold text-foreground">
                      Delivery Confirmation Code (SDC)
                    </h3>
                  </div>
                  <div className="bg-card rounded-lg border p-4 mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Your SDC Code</p>
                    <p className="text-lg font-mono font-bold text-emerald-600 tracking-wider">
                      {order.blockchainCode}
                    </p>
                  </div>
                  {order.blockchainTxHash && (
                    <div className="bg-card rounded-lg border p-4 mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                      <p className="text-xs font-mono text-muted-foreground break-all">
                        {order.blockchainTxHash}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Link2 className="size-3.5" />
                    <span>
                      This code ties your delivered order to Kinmel&apos;s
                      verified-buyer review flow. The review itself gets the
                      public proof record when it is published.
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Review eligibility banner */}
              {isDelivered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center gap-3 rounded-xl border border-verified/30 bg-verified/5 px-5 py-4"
                >
                  <Star className="size-5 text-verified shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      Eligible for proof-backed reviews
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your purchase has been delivered. Leave a verified-buyer
                      review and Kinmel will attach IPFS and on-chain proof
                      data when those services are available.
                    </p>
                  </div>
                  <Badge className="bg-verified/10 text-verified border-verified/20 shrink-0">
                    Verified Buyer
                  </Badge>
                </motion.div>
              )}

              {/* Delivery Timeline */}
              {order.deliveryUpdates && order.deliveryUpdates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-xl border bg-card p-5"
                >
                  <h2 className="text-base font-bold font-heading mb-5">
                    Delivery Timeline
                  </h2>
                  <DeliveryTimeline updates={order.deliveryUpdates} />
                </motion.div>
              )}
            </div>

            {/* Right column — Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="sticky top-20 space-y-6"
              >
                <div className="rounded-xl border bg-card p-5 space-y-3">
                  <h3 className="text-base font-bold font-heading">Order Summary</h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={order.shippingCost === 0 ? 'text-success font-medium' : ''}>
                        {order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VAT (13%)</span>
                      <span>{formatPrice(order.taxAmount)}</span>
                    </div>
                    <Separator className="my-1" />
                    <div className="flex justify-between text-base font-bold">
                      <span>Total</span>
                      <span>{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="rounded-xl border bg-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="size-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Ship To</h3>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p className="font-medium text-foreground">
                      {order.shippingAddress.fullName}
                    </p>
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    <p className="mt-1.5">{order.shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Payment */}
                <div className="rounded-xl border bg-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="size-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Payment</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                    </span>
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="rounded-xl border bg-card p-5">
                    <h3 className="text-sm font-bold text-foreground mb-2">
                      Order Notes
                    </h3>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {canCancel && (
                    <Button
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                      onClick={() => setCancelOpen(true)}
                    >
                      <XCircle className="size-4" />
                      Cancel Order
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    render={<Link href={ROUTES.orders} />}
                  >
                    <ArrowLeft className="size-4" />
                    Back to Orders
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </Container>
      </section>

      {/* Cancel Dialog */}
      <CancelOrderDialog
        orderId={order._id}
        orderNumber={order.orderNumber}
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
      />
    </>
  );
}
