'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Container } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export default function StripeFailurePage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <section className="py-16">
      <Container>
        <div className="mx-auto max-w-lg space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <XCircle className="size-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold">Payment Not Completed</h1>
          <p className="text-muted-foreground">
            Stripe did not complete this payment. Your order has been saved with
            pending payment status, so you can review it from your orders page.
          </p>
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
