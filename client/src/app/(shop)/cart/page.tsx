'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, ArrowLeft, Trash2, Loader2, Truck, Shield } from 'lucide-react';
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
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  return (
    <div className="relative min-h-screen pt-32 pb-24 px-6 md:px-12 overflow-hidden">
      <div className="orb orb-violet -left-20 top-40 size-[24rem] opacity-40" />
      <div className="orb orb-cyan right-0 bottom-40 size-[18rem] opacity-30" />

      <div className="relative max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-[#E63946] mb-3">Shopping Cart</p>
          <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tight gradient-text">
            Your Bag
          </h1>
        </motion.div>

        {!isAuthenticated ? (
          <div className="glass-card mx-auto max-w-xl text-center py-16 px-8">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#E63946]/15 border border-[#E63946]/30">
              <ShoppingBag className="size-7 text-[#E63946]" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-white">Sign in to view your cart</h2>
            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              Your cart is saved to your account so you can come back from any device.
            </p>
            <Link
              href={ROUTES.login}
              className="btn-primary mt-6 inline-flex"
            >
              Sign in
            </Link>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-[#E63946]" />
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mx-auto max-w-xl py-16 px-8 text-center"
          >
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#E63946]/15 border border-[#E63946]/30">
              <ShoppingBag className="size-7 text-[#E63946]" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-white">Your cart is empty</h2>
            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              Add some pieces from the collection and they&apos;ll show up here.
            </p>
            <Link
              href={ROUTES.products}
              className="btn-ghost mt-6 inline-flex items-center gap-2"
            >
              <ArrowLeft className="size-4" />
              Continue shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="glass-card p-5 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Bag summary</p>
                  <h2 className="mt-1 font-heading text-2xl font-bold text-white">
                    {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
                  </h2>
                </div>
                <button
                  onClick={clearCart}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-[#FF6B6B] transition-colors disabled:opacity-40"
                >
                  <Trash2 className="size-3.5" />
                  Clear all
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product._id} className="glass-card p-5">
                    <CartItemRow item={item} />
                  </div>
                ))}
              </div>

              <Link
                href={ROUTES.products}
                className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
              >
                <ArrowLeft className="size-4" />
                Continue shopping
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="glass-card p-6 sticky top-24 space-y-5">
                <h3 className="font-heading text-xl font-bold text-white">Order summary</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">Subtotal ({itemCount} items)</span>
                    <span className="font-medium text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Shipping</span>
                    <span className={shippingCost === 0 ? 'font-medium text-[#E63946]' : 'font-medium text-white'}>
                      {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">VAT (13%)</span>
                    <span className="font-medium text-white">{formatPrice(taxAmount)}</span>
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex justify-between text-lg font-bold text-white">
                  <span>Total</span>
                  <span style={{ color: '#E63946' }}>{formatPrice(totalAmount)}</span>
                </div>

                {shippingCost > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-xs text-white/50 leading-6">
                      Add{' '}
                      <span className="font-semibold text-white">
                        {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}
                      </span>{' '}
                      more for free shipping.
                    </p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                          background: 'linear-gradient(90deg, #E63946, #E63946)',
                        }}
                      />
                    </div>
                  </div>
                )}

                <Link
                  href={ROUTES.checkout}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Proceed to checkout
                  <ArrowRight className="size-4" />
                </Link>

                <div className="flex items-center justify-center gap-4 pt-1 text-xs text-white/30">
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
      </div>
    </div>
  );
}
