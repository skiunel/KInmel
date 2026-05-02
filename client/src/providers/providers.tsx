'use client';

import type { ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';
import { Toaster } from '@/components/ui/sonner';
import { CartDrawer } from '@/components/cart';
import {
  GOOGLE_AUTH_CLIENT_ID,
  GOOGLE_AUTH_ENABLED,
} from '@/lib/runtime-config';

export function Providers({ children }: { children: ReactNode }) {
  const content = (
    <QueryProvider>
      <AuthProvider>
        {children}
        <CartDrawer />
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </QueryProvider>
  );

  if (!GOOGLE_AUTH_ENABLED) {
    return content;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_AUTH_CLIENT_ID}>
      {content}
    </GoogleOAuthProvider>
  );
}
