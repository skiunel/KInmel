'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Container } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { orderService } from '@/services/order.service';
import { useCartStore } from '@/stores/cart-store';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

export default function EsewaSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const data = searchParams.get('data');
    if (!data) {
      setStatus('error');
      setErrorMsg('Missing payment data');
      return;
    }

    orderService
      .verifyEsewaPayment(data)
      .then((result) => {
        setOrderId(result.orderId);
        setStatus('success');
        useCartStore.getState().reset();
      })
      .catch(() => {
        setStatus('error');
        setErrorMsg('Payment verification failed. Please contact support.');
      });
  }, [searchParams]);

  return (
    <section className="py-16">
      <Container>
        <div className="mx-auto max-w-lg text-center">
          {status === 'verifying' && (
            <div className="space-y-4">
              <Loader2 className="mx-auto size-12 animate-spin text-primary" />
              <h1 className="text-xl font-bold">Verifying Payment...</h1>
              <p className="text-muted-foreground">
                Please wait while we confirm your eSewa payment.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="size-10 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold">Payment Successful!</h1>
              <p className="text-muted-foreground">
                Your eSewa payment has been confirmed. Your order is now being processed.
              </p>
              <div className="flex justify-center gap-3">
                <Button render={<Link href={orderId ? `${ROUTES.orders}/confirmation/${orderId}` : ROUTES.orders} />}>
                  View Order
                </Button>
                <Button variant="outline" render={<Link href={ROUTES.products} />}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="size-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold">Payment Verification Failed</h1>
              <p className="text-muted-foreground">{errorMsg}</p>
              <div className="flex justify-center gap-3">
                <Button render={<Link href={ROUTES.orders} />}>
                  My Orders
                </Button>
                <Button variant="outline" onClick={() => router.push(ROUTES.home)}>
                  Go Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
