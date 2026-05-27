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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('stripe');
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
    <div className="min-h-screen bg-white pt-24 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="mb-10 border-b border-[#0A0A0A]/10 pb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#E63946] mb-3">
            ◆ Checkout
          </p>
          <h1 className="font-sans text-4xl md:text-6xl font-black uppercase tracking-[-0.04em] text-[#0A0A0A] leading-[0.95]">
            Complete your order.
          </h1>
        </div>

        {/* Step indicator */}
        <div className="mb-12 flex items-center">
          {STEPS.map((s, i) => {
            const isActive = s.id === step;
            const isCompleted = i < currentStepIndex;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <button
                  onClick={() => {
                    if (isCompleted) setStep(s.id);
                  }}
                  disabled={!isCompleted}
                  className="flex items-center gap-3"
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center font-mono text-xs font-bold transition-colors',
                      isActive
                        ? 'bg-[#0A0A0A] text-white'
                        : isCompleted
                          ? 'bg-[#E63946] text-white cursor-pointer'
                          : 'bg-white border border-[#0A0A0A]/15 text-[#0A0A0A]/40'
                    )}
                  >
                    {isCompleted ? <Check className="size-4" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      'font-mono text-[11px] font-semibold uppercase tracking-[0.22em] hidden sm:inline',
                      isActive ? 'text-[#0A0A0A]' : 'text-[#0A0A0A]/45'
                    )}
                  >
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-px mx-4 transition-colors',
                      isCompleted ? 'bg-[#0A0A0A]' : 'bg-[#0A0A0A]/10'
                    )}
                  />
                )}
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

                  <div className="border border-[#0A0A0A]/10 bg-white p-6">
                    <label
                      htmlFor="notes"
                      className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/55 mb-2 block"
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
                      className="w-full border border-[#0A0A0A]/15 bg-white p-3 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/35 outline-none focus:border-[#0A0A0A] resize-none"
                    />
                    <p className="mt-2 text-right font-mono text-[10px] text-[#0A0A0A]/40">
                      {notes.length}/500
                    </p>
                  </div>

                  <div className="flex justify-between gap-3">
                    <button
                      onClick={() => setStep('shipping')}
                      className="inline-flex items-center justify-center px-6 h-12 border border-[#0A0A0A]/15 bg-white text-[#0A0A0A] font-mono text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-[#0A0A0A] hover:text-white transition-colors"
                    >
                      <ArrowLeft className="size-4 mr-2" />
                      Back
                    </button>
                    <button onClick={handlePaymentContinue} className="inline-flex items-center justify-center px-6 h-12 bg-[#0A0A0A] text-white font-mono text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-[#E63946] transition-colors group">
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
                    <div className="border border-[#E63946] bg-[#E63946]/[0.05] p-4">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="size-4 shrink-0 text-[#E63946]" />
                        <p className="text-sm text-[#E63946]">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between gap-3">
                    <button
                      onClick={() => setStep('payment')}
                      disabled={isPlacing}
                      className="inline-flex items-center justify-center px-6 h-12 border border-[#0A0A0A]/15 bg-white text-[#0A0A0A] font-mono text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-[#0A0A0A] hover:text-white transition-colors disabled:opacity-50"
                    >
                      <ArrowLeft className="size-4 mr-2" />
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacing}
                      className="inline-flex items-center justify-center px-6 h-12 bg-[#0A0A0A] text-white font-mono text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-[#E63946] transition-colors group min-w-[260px] disabled:opacity-60"
                    >
                      {isPlacing ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Processing…
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="size-4 mr-2" />
                          Place order — {formatPrice(totalAmount)}
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
