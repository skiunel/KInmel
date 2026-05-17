'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MailCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { ROUTES } from '@/lib/constants';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/providers/auth-provider';

type Status = 'loading' | 'success' | 'error' | 'missing';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { setUser } = useAuth();
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'missing');
  const [message, setMessage] = useState(
    token ? 'Verifying your email address...' : 'No verification token was provided.'
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const result = await authService.verifyEmail(token);
        if (cancelled) {
          return;
        }

        setUser(result.user);
        setStatus('success');
        setMessage('Your email address has been verified successfully.');
      } catch (error) {
        if (cancelled) {
          return;
        }

        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || 'This verification link is invalid or has expired.';
        setStatus('error');
        setMessage(errorMessage);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [setUser, token]);

  const isSuccess = status === 'success';
  const isLoading = status === 'loading';

  return (
    <Container>
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
              isSuccess
                ? 'bg-emerald-100'
                : status === 'error' || status === 'missing'
                  ? 'bg-red-100'
                  : 'bg-blue-100'
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
            ) : isSuccess ? (
              <MailCheck className="h-8 w-8 text-emerald-700" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-700" />
            )}
          </div>

          <h1 className="text-2xl font-bold">
            {isLoading
              ? 'Verifying Email'
              : isSuccess
                ? 'Email Verified'
                : 'Verification Failed'}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{message}</p>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              render={<Link href={isSuccess ? ROUTES.home : ROUTES.login} />}
            >
              {isSuccess ? 'Continue to Kinmel' : 'Back to Login'}
            </Button>
            <Button variant="outline" render={<Link href={ROUTES.home} />}>
              Return Home
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
