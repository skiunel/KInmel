'use client';

import { GuestRoute } from '@/components/auth';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestRoute>
      <div className="relative flex min-h-screen items-center justify-center bg-[#FAFAF8] text-[#18181B] px-4 py-12">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="w-[400px] h-[400px] rounded-full bg-[#16a34a]/[0.04] blur-[100px]" />
        </div>

        <div className="relative w-full max-w-md z-10">
          <div className="mb-8 flex flex-col items-center">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#16a34a] to-[#22c55e] flex items-center justify-center text-white font-heading text-sm font-extrabold">K</div>
              <span className="font-heading text-xl font-extrabold tracking-tight">kinmel</span>
            </Link>
            <div className="flex items-center gap-1.5 text-[11px] text-[#16a34a] font-medium">
              <Shield className="w-3 h-3" /> Blockchain-verified platform
            </div>
          </div>

          <div className="card p-8">{children}</div>
        </div>
      </div>
    </GuestRoute>
  );
}
