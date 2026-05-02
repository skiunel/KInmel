'use client';

import { Navbar } from '@/components/layout/navbar';
import { Newsletter } from '@/components/layout/newsletter';
import { Footer } from '@/components/layout/footer';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Navbar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <Newsletter />
      <Footer />
    </div>
  );
}
