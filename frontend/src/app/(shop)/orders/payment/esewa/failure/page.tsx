'use client';

import { XCircle } from 'lucide-react';
import { Container } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

export default function EsewaFailurePage() {
  return (
    <section className="py-16">
      <Container>
        <div className="mx-auto max-w-lg text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <XCircle className="size-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold">Payment Failed</h1>
          <p className="text-muted-foreground">
            Your eSewa payment was not completed. Your order has been saved — you can retry payment or choose a different method.
          </p>
          <div className="flex justify-center gap-3">
            <Button render={<Link href={ROUTES.orders} />}>
              View My Orders
            </Button>
            <Button variant="outline" render={<Link href={ROUTES.home} />}>
              Go Home
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
