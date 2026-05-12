'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-white pt-24 pb-24">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="grid lg:grid-cols-12 gap-8 items-end border-b border-[#0A0A0A]/10 pb-12 mb-16"
        >
          <div className="lg:col-span-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#E63946] mb-4">
              ◆ About
            </p>
            <h1 className="font-sans font-black uppercase tracking-[-0.04em] text-[#0A0A0A] leading-[0.9] text-[clamp(3rem,9vw,8rem)]">
              Reviews you can <span className="text-[#E63946]">prove.</span>
            </h1>
          </div>
          <div className="lg:col-span-4">
            <p className="text-[14px] leading-[1.55] text-[#0A0A0A]/65 max-w-md">
              Kinmel is a small catalogue of objects, sold with one rule:
              every review attached to a product is signed by the buyer.
            </p>
          </div>
        </motion.div>

        {/* Section: The problem */}
        <section className="grid lg:grid-cols-12 gap-8 mb-20 border-b border-[#0A0A0A]/10 pb-16">
          <div className="lg:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#E63946]">
              ◆ Problem
            </p>
          </div>
          <div className="lg:col-span-9">
            <p className="font-sans font-medium text-[clamp(1.25rem,2.4vw,1.75rem)] leading-[1.3] tracking-[-0.01em] text-[#0A0A0A] max-w-4xl">
              Most online shops let anyone write a review. Anonymous five-star posts.
              Deleted complaints. Vendors paying for praise.
              <span className="text-[#0A0A0A]/40"> You scroll, you doubt, you guess. </span>
              That isn’t trust — that’s noise dressed up as proof.
            </p>
          </div>
        </section>

        {/* Section: Method */}
        <section className="grid lg:grid-cols-12 gap-8 mb-20 border-b border-[#0A0A0A]/10 pb-16">
          <div className="lg:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#E63946]">
              ◆ Method
            </p>
          </div>
          <div className="lg:col-span-9 grid md:grid-cols-3 gap-8">
            {[
              {
                n: '001',
                title: 'Buy first',
                body: 'Only people whose orders shipped to them can write a review. No order → no voice.',
              },
              {
                n: '002',
                title: 'Sign with key',
                body: 'Each review is signed by the buyer’s wallet. Authorship is provable, attribution permanent.',
              },
              {
                n: '003',
                title: 'Anchor on chain',
                body: 'A hash of the review is written to Polygon Amoy. We can’t silently edit it. Neither can the vendor.',
              },
            ].map((b) => (
              <div key={b.n}>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/40 mb-3">
                  Step {b.n}
                </p>
                <h3 className="font-sans text-2xl font-black uppercase tracking-[-0.02em] text-[#0A0A0A] leading-tight mb-3">
                  {b.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#0A0A0A]/60">
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section: What you get */}
        <section className="grid lg:grid-cols-12 gap-8 mb-20 border-b border-[#0A0A0A]/10 pb-16">
          <div className="lg:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#E63946]">
              ◆ Promise
            </p>
          </div>
          <div className="lg:col-span-9">
            <ul className="space-y-4 max-w-2xl">
              {[
                'No fake stars. Reviews require a paid, shipped order.',
                'No paid placements. No vendor can buy a five-star.',
                'No vanishing complaints. Once on chain, it stays.',
                'No incentives. We don’t pay you to review. The signature is the point.',
              ].map((line, i) => (
                <li key={i} className="flex items-start gap-4 text-[15px] text-[#0A0A0A]">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#E63946] pt-1.5 w-8 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 border-y border-[#0A0A0A]/10">
          {[
            { n: '12,847', label: 'Signed reviews' },
            { n: '2,341', label: 'Objects in stock' },
            { n: '8,529', label: 'Verified buyers' },
            { n: '0', label: 'Fakes ever found' },
          ].map((s, i, arr) => (
            <div
              key={s.label}
              className={`py-10 lg:px-8 px-4 ${i < arr.length - 1 ? 'lg:border-r border-[#0A0A0A]/10' : ''} ${i < 2 ? 'border-b lg:border-b-0 border-[#0A0A0A]/10' : ''}`}
            >
              <p className="font-sans text-4xl md:text-5xl font-black tracking-[-0.03em] text-[#0A0A0A]">{s.n}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/45">
                {s.label}
              </p>
            </div>
          ))}
        </section>

        {/* Footer CTAs */}
        <section className="mt-20 grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <h2 className="font-sans font-black uppercase tracking-[-0.03em] text-[#0A0A0A] leading-[0.95] text-[clamp(2rem,5vw,4rem)]">
              Browse the catalogue.
            </h2>
          </div>
          <div className="lg:col-span-5 flex flex-wrap gap-3 lg:justify-end">
            <Link
              href={ROUTES.products}
              className="inline-flex items-center gap-2 px-6 h-12 bg-[#0A0A0A] text-white font-mono text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#E63946] transition-colors"
            >
              Shop <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/verify"
              className="inline-flex items-center gap-2 px-6 h-12 border border-[#0A0A0A] text-[#0A0A0A] font-mono text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#0A0A0A] hover:text-white transition-colors"
            >
              Public ledger <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
