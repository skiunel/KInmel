'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, ArrowLeft, Trash2, Loader2, Truck, Shield } from 'lucide-react';
import { Container, PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CartItemRow } from '@/components/cart';
import { formatPrice } from '@/lib/utils';
import { ROUTES, FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import { useCartStore } from '@/stores/cart-store';
import { useAuth } from '@/providers/auth-provider';

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const {
    items,
    itemCount,
    subtotal,
    shippingCost,
    taxAmount,
    totalAmount,
    isLoading,
    isUpdating,
    fetchCart,
    clearCart,
  } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  return (
    <>
      <PageHeader
        title="Shopping Cart"
        description="Review the pieces in your bag before moving into checkout."
        breadcrumbs={[
          { label: 'Home', href: ROUTES.home },
          { label: 'Cart' },
        ]}
      />

      <section className="px-3 pb-16 pt-8 sm:px-5 sm:pb-20 sm:pt-10">
        <Container className="max-w-[92rem] px-0">
          {!isAuthenticated ? (
            <div className="storefront-panel mx-auto max-w-xl text-center py-14">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/86 shadow-[0_12px_28px_rgba(43,33,23,0.08)]">
                <ShoppingBag className="size-7 text-slate-500" />
              </div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                Sign in to view your cart
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Your cart is saved to your account, so you can come back to it from any device.
              </p>
              <Button
                className="storefront-button-primary mt-6 border-transparent px-6 text-white"
                render={<Link href={ROUTES.login} />}
              >
                Sign in
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-slate-500" />
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="storefront-panel mx-auto max-w-xl py-14 text-center"
            >
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/86 shadow-[0_12px_28px_rgba(43,33,23,0.08)]">
                <ShoppingBag className="size-7 text-slate-500" />
              </div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                Your cart is empty
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Add a few pieces from the collection and they&apos;ll show up here.
              </p>
              <Button
                className="storefront-button-secondary mt-6 border-black/8 px-6 text-slate-900"
                render={<Link href={ROUTES.products} />}
              >
                <ArrowLeft className="size-4" />
                Continue shopping
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="storefront-panel">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="storefront-kicker">Bag summary</p>
                      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                        {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
                      </h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="self-start text-slate-500 hover:bg-black/[0.03] hover:text-slate-900"
                      onClick={clearCart}
                      disabled={isUpdating}
                    >
                      <Trash2 className="size-3.5" />
                      Clear all
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product._id} className="storefront-card">
                      <CartItemRow item={item} />
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="storefront-button-secondary border-black/8 px-5 text-slate-900"
                  render={<Link href={ROUTES.products} />}
                >
                  <ArrowLeft className="size-4" />
                  Continue shopping
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="storefront-panel-muted sticky top-24 space-y-4">
                  <h3 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                    Order summary
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subtotal ({itemCount} items)</span>
                      <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Shipping</span>
                      <span className={shippingCost === 0 ? 'font-medium text-[#657da8]' : 'font-medium text-slate-900'}>
                        {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">VAT (13%)</span>
                      <span className="font-medium text-slate-900">{formatPrice(taxAmount)}</span>
                    </div>
                  </div>

                  <Separator className="bg-black/8" />

                  <div className="flex justify-between text-lg font-semibold text-slate-900">
                    <span>Total</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>

                  {shippingCost > 0 && (
                    <div className="rounded-[1.4rem] border border-black/8 bg-white/76 px-4 py-4">
                      <p className="text-xs leading-6 text-slate-600">
                        Add{' '}
                        <span className="font-semibold text-slate-900">
                          {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}
                        </span>{' '}
                        more for free shipping.
                      </p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-[#9fb4d6] transition-all"
                          style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    size="lg"
                    className="storefront-button-primary w-full border-transparent text-white"
                    render={<Link href={ROUTES.checkout} />}
                  >
                    Proceed to checkout
                    <ArrowRight className="size-4" />
                  </Button>

                  <div className="flex items-center justify-center gap-4 pt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Truck className="size-3.5" /> Fast delivery
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="size-3.5" /> Secure checkout
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
