'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Container } from './container';
import { ROUTES } from '@/lib/constants';

export function Newsletter() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (pathname === ROUTES.home) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section className="px-6 md:px-12 py-12 border-t border-[#e4e4e7]">
      <Container className="max-w-2xl text-center">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-[#18181B]">Stay updated</h2>
        <p className="mt-2 text-sm text-[#71717a] mb-6">
          Get notified about new products and verified review highlights.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center gap-2 max-w-md mx-auto">
          <input
            type="email" placeholder="Email address" value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email" suppressHydrationWarning required
            className="h-10 w-full rounded-lg border border-[#e4e4e7] bg-white px-4 text-sm outline-none placeholder:text-[#a1a1aa] focus:border-[rgba(22,163,74,0.4)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.08)] transition-all"
          />
          <button type="submit" className="btn-primary !rounded-lg !px-4 h-10 flex-shrink-0 !py-0">
            {submitted ? 'Subscribed ✓' : 'Subscribe'}
          </button>
        </form>
      </Container>
    </section>
  );
}
