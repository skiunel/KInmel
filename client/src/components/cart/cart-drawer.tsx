'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { ROUTES, FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import { useCartStore } from '@/stores/cart-store';
import { CartItemRow } from './cart-item-row';

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    shippingCost,
    taxAmount,
    totalAmount,
    isLoading,
    drawerOpen,
    closeDrawer,
  } = useCartStore();

  // Lock body scroll
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [drawerOpen]);

  // Close on escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDrawer();
    }
    if (drawerOpen) {
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }
  }, [drawerOpen, closeDrawer]);

  const freeShippingDelta = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5" />
                <h2 className="text-lg font-bold font-heading">
                  Cart ({itemCount})
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeDrawer}
                className="text-muted-foreground"
              >
                <X className="size-5" />
              </Button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                    <ShoppingBag className="size-7 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Your cart is empty</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Browse products and add items to get started.
                    </p>
                  </div>
                  <Button
                    render={<Link href={ROUTES.products} />}
                    onClick={closeDrawer}
                  >
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 p-5">
                  {/* Free shipping progress */}
                  {freeShippingDelta > 0 && (
                    <div className="rounded-lg bg-primary/5 px-4 py-3">
                      <p className="text-xs text-muted-foreground">
                        Add <span className="font-semibold text-primary">{formatPrice(freeShippingDelta)}</span> more for free shipping
                      </p>
                      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  {items.map((item) => (
                    <CartItemRow key={item.product._id} item={item} compact />
                  ))}
                </div>
              )}
            </div>

            {/* Footer — Summary */}
            {items.length > 0 && (
              <div className="border-t px-5 py-4 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (13%)</span>
                    <span>{formatPrice(taxAmount)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    size="lg"
                    className="w-full font-semibold"
                    render={<Link href={ROUTES.checkout} />}
                    onClick={closeDrawer}
                  >
                    Checkout
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    render={<Link href={ROUTES.cart} />}
                    onClick={closeDrawer}
                  >
                    View full cart
                  </Button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
