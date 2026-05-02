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
} from 'lucide-react';
import { Container, PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ShippingForm,
  PaymentMethod,
  OrderReview,
  CheckoutSummary,
} from '@/components/checkout';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useCartStore } from '@/stores/cart-store';
import { useAuth } from '@/providers/auth-provider';
import { orderService } from '@/services/order.service';
import { toast } from 'sonner';
import type { ShippingFormData } from '@/lib/validations/checkout';

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
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'esewa' | 'khalti' | 'bank_transfer'>('cod');
  const [notes, setNotes] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(ROUTES.login);
    }
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

      if (result.payment?.paymentUrl) {
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
        <Loader2 className="size-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  return (
    <>
      <PageHeader
        title="Checkout"
        description="Finish your order with the same lighter layout and direct flow as the storefront."
        breadcrumbs={[
          { label: 'Home', href: ROUTES.home },
          { label: 'Cart', href: ROUTES.cart },
          { label: 'Checkout' },
        ]}
      />

      <section className="px-3 pb-16 pt-8 sm:px-5 sm:pb-20 sm:pt-10">
        <Container className="max-w-[92rem] px-0">
          <div className="mb-10 flex items-center justify-center gap-0">
            {STEPS.map((s, i) => {
              const isActive = s.id === step;
              const isCompleted = i < currentStepIndex;

              return (
                <div key={s.id} className="flex items-center">
                  {i > 0 && (
                    <div
                      className={cn(
                        'h-px w-12 sm:w-20 transition-colors',
                        isCompleted ? 'bg-slate-900' : 'bg-black/10'
                      )}
                    />
                  )}
                  <button
                    onClick={() => {
                      if (isCompleted) setStep(s.id);
                    }}
                    disabled={!isCompleted}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                        isActive
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : isCompleted
                            ? 'border-black/8 bg-white text-slate-900 cursor-pointer'
                            : 'border-black/8 bg-white/64 text-slate-500'
                      )}
                    >
                      {isCompleted ? <Check className="size-4" /> : i + 1}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        isActive ? 'text-slate-900' : 'text-slate-500'
                      )}
                    >
                      {s.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="lg:col-span-1">
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
                    <PaymentMethod
                      selected={paymentMethod}
                      onChange={setPaymentMethod}
                    />

                    <div className="storefront-card space-y-3">
                      <label
                        htmlFor="notes"
                        className="block text-sm font-semibold text-slate-900"
                      >
                        Order notes <span className="font-normal text-slate-500">(optional)</span>
                      </label>
                      <Textarea
                        id="notes"
                        placeholder="Special delivery instructions, gift message, or checkout note."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        maxLength={500}
                        className="storefront-textarea min-h-28 border-black/8 bg-white/90 px-4 py-4 text-slate-900"
                      />
                      <p className="text-right text-xs text-slate-500">{notes.length}/500</p>
                    </div>

                    <div className="flex justify-between gap-3">
                      <Button
                        variant="outline"
                        className="storefront-button-secondary border-black/8 text-slate-900"
                        onClick={() => setStep('shipping')}
                      >
                        <ArrowLeft className="size-4" />
                        Back
                      </Button>
                      <Button
                        size="lg"
                        className="storefront-button-primary min-w-[200px] border-transparent text-white"
                        onClick={handlePaymentContinue}
                      >
                        Review order
                      </Button>
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
                      <div className="rounded-[1.4rem] border border-red-200 bg-red-50 p-4">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="size-5 shrink-0 text-red-500" />
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between gap-3">
                      <Button
                        variant="outline"
                        className="storefront-button-secondary border-black/8 text-slate-900"
                        onClick={() => setStep('payment')}
                        disabled={isPlacing}
                      >
                        <ArrowLeft className="size-4" />
                        Back
                      </Button>
                      <Button
                        size="lg"
                        className="storefront-button-primary min-w-[220px] border-transparent text-white"
                        onClick={handlePlaceOrder}
                        disabled={isPlacing}
                      >
                        {isPlacing ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Placing order...
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="size-4" />
                            Place order - {formatPrice(totalAmount)}
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <div className="sticky top-24">
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
        </Container>
      </section>
    </>
  );
}
