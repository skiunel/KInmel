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
    <div className="min-h-screen bg-white pt-24 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-10 border-b border-[#0A0A0A]/10 pb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#E63946] mb-3">◆ Shopping Bag</p>
          <h1 className="font-sans text-4xl md:text-6xl font-black uppercase tracking-[-0.04em] text-[#0A0A0A] leading-[0.95]">
            Your bag.
          </h1>
        </motion.div>

        {!isAuthenticated ? (
          <div className="border border-[#0A0A0A]/10 bg-white mx-auto max-w-xl text-center py-16 px-8">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-none bg-[#E63946]/15 border border-[#E63946]/30">
              <ShoppingBag className="size-7 text-[#E63946]" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-[#0A0A0A]">Sign in to view your cart</h2>
            <p className="mt-3 text-sm text-[#0A0A0A]/60 leading-relaxed">
              Your cart is saved to your account so you can come back from any device.
            </p>
            <Link
              href={ROUTES.login}
              className="inline-flex items-center justify-center px-6 h-12 bg-[#0A0A0A] text-white font-mono text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-[#E63946] transition-colors mt-6 inline-flex"
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
            className="border border-[#0A0A0A]/10 bg-white mx-auto max-w-xl py-16 px-8 text-center"
          >
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-none bg-[#E63946]/15 border border-[#E63946]/30">
              <ShoppingBag className="size-7 text-[#E63946]" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-[#0A0A0A]">Your cart is empty</h2>
            <p className="mt-3 text-sm text-[#0A0A0A]/60 leading-relaxed">
              Add some pieces from the collection and they&apos;ll show up here.
            </p>
            <Link
              href={ROUTES.products}
              className="mt-6 inline-flex items-center gap-2 px-6 h-12 border border-[#0A0A0A]/15 bg-white text-[#0A0A0A] font-mono text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-[#0A0A0A] hover:text-white transition-colors"
            >
              <ArrowLeft className="size-4" />
              Continue shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="border border-[#0A0A0A]/10 bg-white p-5 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A]/40">Bag summary</p>
                  <h2 className="mt-1 font-heading text-2xl font-bold text-[#0A0A0A]">
                    {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
                  </h2>
                </div>
                <button
                  onClick={clearCart}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1.5 text-xs text-[#0A0A0A]/40 hover:text-[#E63946] transition-colors disabled:opacity-40"
                >
                  <Trash2 className="size-3.5" />
                  Clear all
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product._id} className="border border-[#0A0A0A]/10 bg-white p-5">
                    <CartItemRow item={item} />
                  </div>
                ))}
              </div>

              <Link
                href={ROUTES.products}
                className="inline-flex items-center gap-2 text-sm text-[#0A0A0A]/50 hover:text-[#0A0A0A] transition-colors"
              >
                <ArrowLeft className="size-4" />
                Continue shopping
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="border border-[#0A0A0A]/10 bg-white p-6 sticky top-24 space-y-5">
                <h3 className="font-heading text-xl font-bold text-[#0A0A0A]">Order summary</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#0A0A0A]/50">Subtotal ({itemCount} items)</span>
                    <span className="font-medium text-[#0A0A0A]">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#0A0A0A]/50">Shipping</span>
                    <span className={shippingCost === 0 ? 'font-medium text-[#E63946]' : 'font-medium text-[#0A0A0A]'}>
                      {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#0A0A0A]/50">VAT (13%)</span>
                    <span className="font-medium text-[#0A0A0A]">{formatPrice(taxAmount)}</span>
                  </div>
                </div>

                <div className="h-px bg-[#0A0A0A]/10" />

                <div className="flex justify-between items-baseline pt-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/55">Total</span>
                  <span className="font-sans text-2xl font-black text-[#0A0A0A] tabular-nums">{formatPrice(totalAmount)}</span>
                </div>

                {shippingCost > 0 && (
                  <div className="rounded-none border border-[#0A0A0A]/10 bg-[#F4F4F4] p-4">
                    <p className="text-xs text-[#0A0A0A]/50 leading-6">
                      Add{' '}
                      <span className="font-semibold text-[#0A0A0A]">
                        {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}
                      </span>{' '}
                      more for free shipping.
                    </p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-none bg-[#0A0A0A]/10">
                      <div
                        className="h-full rounded-none transition-all"
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
                  className="inline-flex items-center justify-center px-6 h-12 bg-[#0A0A0A] text-white font-mono text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-[#E63946] transition-colors w-full flex items-center justify-center gap-2"
                >
                  Proceed to checkout
                  <ArrowRight className="size-4" />
                </Link>

                <div className="flex items-center justify-center gap-4 pt-1 text-xs text-[#0A0A0A]/30">
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
