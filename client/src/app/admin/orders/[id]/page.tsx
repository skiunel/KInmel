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
  User,
  Truck,
  Package,
  CircleCheck,
  XCircle,
  Loader2,
  AlertCircle,
  ClipboardList,
  Clock,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/admin';
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  DeliveryTimeline,
} from '@/components/orders';
import { PageLoader } from '@/components/shared';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useAdminOrder, useUpdateOrderStatus } from '@/hooks/use-admin-orders';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

// ─── Status Transitions ───

interface StatusAction {
  target: OrderStatus;
  label: string;
  icon: typeof Package;
  variant: 'default' | 'destructive' | 'outline';
  className?: string;
  description: string;
}

function getAvailableActions(current: OrderStatus): StatusAction[] {
  const map: Partial<Record<OrderStatus, StatusAction[]>> = {
    pending: [
      {
        target: 'confirmed',
        label: 'Confirm Order',
        icon: Check,
        variant: 'default',
        description: 'Verify payment and confirm the order for processing',
      },
      {
        target: 'cancelled',
        label: 'Cancel Order',
        icon: XCircle,
        variant: 'destructive',
        description: 'Cancel order and restore product stock',
      },
    ],
    confirmed: [
      {
        target: 'processing',
        label: 'Start Processing',
        icon: Package,
        variant: 'default',
        description: 'Begin packing and preparing the order for shipment',
      },
      {
        target: 'cancelled',
        label: 'Cancel Order',
        icon: XCircle,
        variant: 'destructive',
        description: 'Cancel order and restore product stock',
      },
    ],
    processing: [
      {
        target: 'shipped',
        label: 'Mark Shipped',
        icon: Truck,
        variant: 'default',
        className: 'bg-purple-600 hover:bg-purple-700',
        description: 'Order has been handed to the delivery carrier',
      },
    ],
    shipped: [
      {
        target: 'delivered',
        label: 'Mark Delivered',
        icon: CircleCheck,
        variant: 'default',
        className: 'bg-emerald-600 hover:bg-emerald-700',
        description: 'Confirm successful delivery to the customer',
      },
    ],
  };
  return map[current] || [];
}

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Cash on Delivery',
  esewa: 'eSewa',
  khalti: 'Khalti',
  bank_transfer: 'Bank Transfer',
};

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading, error } = useAdminOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const [copied, setCopied] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateLocation, setUpdateLocation] = useState('');
  const [activeAction, setActiveAction] = useState<OrderStatus | null>(null);

  if (isLoading) {
    return <PageLoader text="Loading order..." />;
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="size-12 text-destructive" />
        <h1 className="mt-4 text-xl font-bold">Order Not Found</h1>
        <Button className="mt-6" render={<Link href={ROUTES.adminOrders} />}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const userName = typeof order.user === 'object' ? order.user.name : 'Customer';
  const userEmail = typeof order.user === 'object' ? order.user.email : '';
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const actions = getAvailableActions(order.status);

  function copyOrderNumber() {
    navigator.clipboard.writeText(order!.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleStatusUpdate(target: OrderStatus) {
    await updateStatus.mutateAsync({
      id: order!._id,
      status: target,
      message: updateMessage || undefined,
      location: updateLocation || undefined,
    });
    setActiveAction(null);
    setUpdateMessage('');
    setUpdateLocation('');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Button
              variant="ghost"
              size="icon-sm"
              render={<Link href={ROUTES.adminOrders} />}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight font-heading">
              {order.orderNumber}
            </h1>
            <button
              onClick={copyOrderNumber}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? (
                <Check className="size-4 text-success" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </div>
          <p className="text-sm text-muted-foreground ml-10">
            Placed {formatDateTime(order.createdAt)} by {userName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} size="md" />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Order Total"
          value={formatPrice(order.totalAmount)}
          icon={ClipboardList}
        />
        <StatCard
          label="Items"
          value={itemCount}
          icon={Package}
          variant="chain"
        />
        <StatCard
          label="Payment"
          value={PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
          icon={CreditCard}
          variant="verified"
        />
        <StatCard
          label="Placed"
          value={formatDate(order.createdAt)}
          icon={Calendar}
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left column (2 cols) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Status Actions */}
          {actions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border-2 border-primary/20 bg-primary/[0.02] p-5"
            >
              <h2 className="text-base font-bold font-heading mb-4 flex items-center gap-2">
                <Send className="size-4 text-primary" />
                Status Actions
              </h2>

              <div className="space-y-3">
                {actions.map((action) => {
                  const Icon = action.icon;
                  const isExpanded = activeAction === action.target;

                  return (
                    <div
                      key={action.target}
                      className="rounded-lg border bg-card overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setActiveAction(isExpanded ? null : action.target)
                        }
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg',
                            action.variant === 'destructive'
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-primary/10 text-primary'
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{action.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          → {action.target}
                        </Badge>
                      </button>

                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          className="border-t"
                        >
                          <div className="p-4 space-y-3 bg-muted/30">
                            <div>
                              <label className="text-xs font-medium text-foreground block mb-1">
                                Update Message{' '}
                                <span className="text-muted-foreground font-normal">
                                  (optional)
                                </span>
                              </label>
                              <Textarea
                                placeholder={`e.g. "Order confirmed, preparing for shipment"`}
                                value={updateMessage}
                                onChange={(e) => setUpdateMessage(e.target.value)}
                                rows={2}
                                className="text-sm"
                              />
                            </div>
                            {(action.target === 'shipped' ||
                              action.target === 'delivered') && (
                              <div>
                                <label className="text-xs font-medium text-foreground block mb-1">
                                  Location{' '}
                                  <span className="text-muted-foreground font-normal">
                                    (optional)
                                  </span>
                                </label>
                                <Input
                                  placeholder="e.g. Kathmandu Hub"
                                  value={updateLocation}
                                  onChange={(e) =>
                                    setUpdateLocation(e.target.value)
                                  }
                                  className="text-sm"
                                />
                              </div>
                            )}
                            <div className="flex justify-end gap-2 pt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveAction(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant={action.variant}
                                className={action.className}
                                onClick={() =>
                                  handleStatusUpdate(action.target)
                                }
                                disabled={updateStatus.isPending}
                              >
                                {updateStatus.isPending ? (
                                  <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <Icon className="size-3.5" />
                                    {action.label}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Cancelled banner */}
          {order.status === 'cancelled' && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
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
                    {formatDateTime(order.cancelledAt)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Items table */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-base font-bold font-heading">
                Items ({itemCount})
              </h2>
              <Badge variant="secondary" className="text-xs">
                {order.items.length} product{order.items.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Header row */}
            <div className="hidden sm:grid grid-cols-[1fr_80px_80px_100px] gap-4 border-b bg-muted/30 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Product</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Price</span>
              <span className="text-right">Total</span>
            </div>

            <div className="divide-y">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[1fr_80px_80px_100px] sm:gap-4 sm:items-center"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[9px] text-muted-foreground">
                          N/A
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {item.sku}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-center hidden sm:block">
                    {item.quantity}
                  </p>
                  <p className="text-sm text-right hidden sm:block">
                    {formatPrice(item.price)}
                  </p>
                  <p className="text-sm font-semibold text-right hidden sm:block">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  {/* Mobile meta */}
                  <div className="flex justify-between sm:hidden text-xs text-muted-foreground">
                    <span>
                      {item.quantity} × {formatPrice(item.price)}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals footer */}
            <div className="border-t bg-muted/20 px-5 py-4 space-y-1.5 text-sm">
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
                <span className="text-muted-foreground">
                  VAT ({Math.round(order.taxRate * 100)}%)
                </span>
                <span>{formatPrice(order.taxAmount)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Timeline */}
          {order.deliveryUpdates && order.deliveryUpdates.length > 0 && (
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-5">
                <Clock className="size-4 text-primary" />
                <h2 className="text-base font-bold font-heading">
                  Audit Trail / Delivery Timeline
                </h2>
              </div>
              <DeliveryTimeline updates={order.deliveryUpdates} />
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border bg-card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <User className="size-4 text-primary" />
              <h3 className="text-sm font-bold">Customer</h3>
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium text-foreground">{userName}</p>
              {userEmail && (
                <p className="text-muted-foreground">{userEmail}</p>
              )}
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border bg-card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="size-4 text-primary" />
              <h3 className="text-sm font-bold">Shipping Address</h3>
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
          </motion.div>

          {/* Payment */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border bg-card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="size-4 text-primary" />
              <h3 className="text-sm font-bold">Payment</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
              </span>
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </motion.div>

          {/* Dates */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border bg-card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="size-4 text-primary" />
              <h3 className="text-sm font-bold">Key Dates</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Placed</span>
                <span>{formatDateTime(order.createdAt)}</span>
              </div>
              {order.estimatedDelivery && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Delivery</span>
                  <span>{formatDate(order.estimatedDelivery)}</span>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivered</span>
                  <span className="text-success font-medium">
                    {formatDateTime(order.deliveredAt)}
                  </span>
                </div>
              )}
              {order.cancelledAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cancelled</span>
                  <span className="text-destructive font-medium">
                    {formatDateTime(order.cancelledAt)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Order notes */}
          {order.notes && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border bg-card p-5"
            >
              <h3 className="text-sm font-bold mb-2">Customer Notes</h3>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
