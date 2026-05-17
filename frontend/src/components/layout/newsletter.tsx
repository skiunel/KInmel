'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
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
    <section className="border-t border-[#EDE7DA]/8 bg-[#0B0B0D]">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-16 grid lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#FF3D00] mb-4">
            ◆ Dispatch
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-black uppercase tracking-[-0.03em] text-[#EDE7DA] leading-none">
            Letters,<br />
            <span className="italic font-light">occasionally.</span>
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="lg:col-span-5 flex border border-[#EDE7DA]/15">
          <input
            type="email"
            placeholder="email@address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            suppressHydrationWarning
            required
            className="flex-1 h-14 px-5 bg-transparent text-sm text-[#EDE7DA] placeholder:text-[#EDE7DA]/35 outline-none"
          />
          <button
            type="submit"
            className="h-14 px-7 bg-[#FF3D00] text-[#0B0B0D] font-mono text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-[#EDE7DA] transition-colors"
          >
            {submitted ? '✓ Subscribed' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  );
}
