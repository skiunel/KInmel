'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { PageLoader } from '@/components/shared';
import { ROUTES } from '@/lib/constants';

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowAuthenticated =
    pathname === ROUTES.verifyEmail ||
    pathname === ROUTES.forgotPassword ||
    pathname === ROUTES.resetPassword;

  useEffect(() => {
    if (!isLoading && isAuthenticated && !allowAuthenticated) {
      router.replace(isAdmin ? ROUTES.admin : ROUTES.home);
    }
  }, [allowAuthenticated, isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated && !allowAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
