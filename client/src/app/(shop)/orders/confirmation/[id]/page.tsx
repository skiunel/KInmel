'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Package,
  Truck,
  Calendar,
  MapPin,
  ArrowRight,
  Copy,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Container } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { orderService } from '@/services/order.service';
import type { Order } from '@/types';

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await orderService.getOrder(id);
        setOrder(data);
      } catch {
        setError('Could not load order details.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  function copyOrderNumber() {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-md text-center">
            <AlertCircle className="mx-auto size-12 text-destructive" />
            <h1 className="mt-4 text-xl font-bold">Order Not Found</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button className="mt-6" render={<Link href={ROUTES.home} />}>
              Go Home
            </Button>
          </div>
        </Container>
      </section>
    );
  }

  const estimatedDate = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <section className="py-12 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl">
          {/* Success header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-success/10"
            >
              <CheckCircle2 className="size-10 text-success" />
            </motion.div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-heading">
              Order Confirmed!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
          </motion.div>

          {/* Order number */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border bg-card p-6 text-center mb-6"
          >
            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-bold font-mono text-foreground">
                {order.orderNumber}
              </span>
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
          </motion.div>

          {/* Timeline cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8"
          >
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <Package className="size-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-semibold text-foreground capitalize">
                  {order.status}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <Truck className="size-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Payment</p>
                <p className="text-sm font-semibold text-foreground">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <Calendar className="size-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Est. Delivery</p>
                <p className="text-sm font-semibold text-foreground">
                  {estimatedDate || '5–7 business days'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Order details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border bg-card overflow-hidden mb-8"
          >
            {/* Items */}
            <div className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Items Ordered
              </h3>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="p-5 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (13%)</span>
                <span>{formatPrice(order.taxAmount)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            <Separator />

            {/* Shipping address */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Delivery Address</h3>
              </div>
              <div className="text-sm text-muted-foreground pl-6 space-y-0.5">
                <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <Button
              size="lg"
              className="font-semibold"
              render={<Link href={ROUTES.products} />}
            >
              Continue Shopping
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              render={<Link href={ROUTES.orders} />}
            >
              View My Orders
            </Button>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
