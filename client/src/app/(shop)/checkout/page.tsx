'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import {
  ShippingForm,
  PaymentMethod,
  OrderReview,
  CheckoutSummary,
} from '@/components/checkout';
import { formatPrice, cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useCartStore } from '@/stores/cart-store';
import { useAuth } from '@/providers/auth-provider';
import { orderService } from '@/services/order.service';
import { toast } from 'sonner';
import type { ShippingFormData } from '@/lib/validations/checkout';
import type { PaymentMethodId } from '@/components/checkout/payment-method';

type Step = 'shipping' | 'payment' | 'review';

const STEPS: { id: Step; label: string }[] = [
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    items,
    subtotal,
    shippingCost,
    taxAmount,
    totalAmount,
    isLoading: cartLoading,
    fetchCart,
  } = useCartStore();

  const [step, setStep] = useState<Step>('shipping');
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('esewa');
  const [notes, setNotes] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push(ROUTES.login);
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!cartLoading && isAuthenticated && items.length === 0 && !isPlacing) {
      router.push(ROUTES.cart);
    }
  }, [cartLoading, isAuthenticated, items.length, isPlacing, router]);

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  function handleShippingSubmit(data: ShippingFormData) {
    setShippingData(data);
    setStep('payment');
  }

  function handlePaymentContinue() {
    setStep('review');
  }

  async function handlePlaceOrder() {
    if (!shippingData) return;

    setIsPlacing(true);
    setError(null);

    try {
      const result = await orderService.checkout({
        shippingAddress: shippingData,
        paymentMethod,
        notes: notes || undefined,
      });

      if (result.payment?.paymentUrl && result.payment.payload) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = result.payment.paymentUrl;
        Object.entries(result.payment.payload).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      }

      // Stripe redirect URL handling
      if (result.payment?.redirectUrl) {
        window.location.href = result.payment.redirectUrl;
        return;
      }

      useCartStore.getState().reset();
      toast.success('Order placed successfully!');
      router.push(`${ROUTES.orders}/confirmation/${result.order._id}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to place order. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsPlacing(false);
    }
  }

  if (authLoading || cartLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="size-8 animate-spin text-[#E63946]" />
      </div>
    );
  }

  if (!isAuthenticated || items.length === 0) return null;

  return (
    <div className="relative min-h-screen pt-32 pb-24 px-6 md:px-12 overflow-hidden">
      <div className="orb orb-violet -left-20 top-40 size-[24rem] opacity-40" />
      <div className="orb orb-cyan right-0 top-1/2 size-[20rem] opacity-40" />

      <div className="relative max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-[#E63946] mb-3">
            Checkout
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tight gradient-text">
            Complete your order
          </h1>
        </div>

        {/* Step indicator */}
        <div className="mb-12 flex items-center justify-center">
          {STEPS.map((s, i) => {
            const isActive = s.id === step;
            const isCompleted = i < currentStepIndex;
            return (
              <div key={s.id} className="flex items-center">
                {i > 0 && (
                  <div
                    className={cn(
                      'h-px w-12 sm:w-24 transition-colors',
                      isCompleted ? 'bg-[#E63946]' : 'bg-white/10'
                    )}
                  />
                )}
                <button
                  onClick={() => {
                    if (isCompleted) setStep(s.id);
                  }}
                  disabled={!isCompleted}
                  className="flex flex-col items-center gap-2 px-2"
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all',
                      isActive
                        ? 'bg-gradient-to-r from-[#E63946] to-[#E63946] text-white shadow-[0_0_20px_rgba(230,57,70,0.5)]'
                        : isCompleted
                          ? 'bg-[#00FF88]/15 border border-[#00FF88]/30 text-[#00FF88] cursor-pointer'
                          : 'bg-white/[0.04] border border-white/10 text-white/40'
                    )}
                  >
                    {isCompleted ? <Check className="size-4" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium font-mono uppercase tracking-widest',
                      isActive ? 'text-white' : 'text-white/40'
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Two column: form + summary */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_0.9fr]">
          <div>
            <AnimatePresence mode="wait">
              {step === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  <ShippingForm
                    defaultValues={shippingData || undefined}
                    onSubmit={handleShippingSubmit}
                  />
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <PaymentMethod selected={paymentMethod} onChange={setPaymentMethod} />

                  <div className="glass-card p-6">
                    <label
                      htmlFor="notes"
                      className="font-mono text-xs uppercase tracking-widest text-white/60 mb-2 block"
                    >
                      Order notes (optional)
                    </label>
                    <textarea
                      id="notes"
                      placeholder="Special delivery instructions, gift message, etc."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      maxLength={500}
                      className="glass-input w-full resize-none"
                    />
                    <p className="mt-2 text-right text-xs text-white/40">
                      {notes.length}/500
                    </p>
                  </div>

                  <div className="flex justify-between gap-3">
                    <button onClick={() => setStep('shipping')} className="btn-ghost">
                      <ArrowLeft className="size-4 mr-2" />
                      Back
                    </button>
                    <button onClick={handlePaymentContinue} className="btn-primary group">
                      Review order
                      <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'review' && shippingData && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <OrderReview
                    items={items}
                    shipping={shippingData}
                    paymentMethod={paymentMethod}
                    notes={notes}
                    onEditShipping={() => setStep('shipping')}
                    onEditPayment={() => setStep('payment')}
                  />

                  {error && (
                    <div className="glass-card p-4 border-[#FF6B6B]/40 bg-[#FF6B6B]/[0.08]">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="size-5 shrink-0 text-[#FF6B6B]" />
                        <p className="text-sm text-[#FF6B6B]">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between gap-3">
                    <button
                      onClick={() => setStep('payment')}
                      disabled={isPlacing}
                      className="btn-ghost"
                    >
                      <ArrowLeft className="size-4 mr-2" />
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacing}
                      className="btn-primary pulse-glow group min-w-[240px]"
                    >
                      {isPlacing ? (
                        <>
                          {/* Spinning blockchain ring */}
                          <div className="relative size-5 mr-2">
                            <div
                              className="absolute inset-0 rounded-full border-2 border-transparent"
                              style={{
                                borderTopColor: '#FFFFFF',
                                borderRightColor: '#E63946',
                                animation: 'spin 1s linear infinite',
                              }}
                            />
                          </div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="size-4 mr-2" />
                          Place Order — {formatPrice(totalAmount)}
                          <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="sticky top-28">
              <CheckoutSummary
                items={items}
                subtotal={subtotal}
                shippingCost={shippingCost}
                taxAmount={taxAmount}
                totalAmount={totalAmount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
