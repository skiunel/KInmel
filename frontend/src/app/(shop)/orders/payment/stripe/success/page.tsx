'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, CreditCard } from 'lucide-react';
import { Container } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { useCartStore } from '@/stores/cart-store';

export default function StripeSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    useCartStore.getState().reset();
  }, []);

  return (
    <section className="py-16">
      <Container>
        <div className="mx-auto max-w-lg space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="size-10 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <CreditCard className="size-3.5" />
              Stripe checkout
            </p>
            <h1 className="text-2xl font-bold">Payment Successful</h1>
          </div>
          <p className="text-muted-foreground">
            Stripe accepted your payment. Your order is now being processed, and the
            payment status will update as soon as the webhook confirmation arrives.
          </p>
          {sessionId && (
            <p className="break-all rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
              Session: {sessionId}
            </p>
          )}
          <div className="flex justify-center gap-3">
            <Button
              render={
                <Link
                  href={orderId ? `${ROUTES.orders}/confirmation/${orderId}` : ROUTES.orders}
                />
              }
            >
              View Order
            </Button>
            <Button variant="outline" render={<Link href={ROUTES.products} />}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
