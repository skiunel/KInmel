'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ROUTES } from '@/lib/constants';

export function HeroSection() {
  return (
    <section className="relative bg-white pt-24 pb-12 border-b border-[#0A0A0A]/10">
      {/* Top tagline strip */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 mb-16 lg:mb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="grid lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-7">
            <h1 className="font-sans font-black uppercase tracking-[-0.04em] leading-[0.92] text-[clamp(3.5rem,10vw,10rem)] text-[#0A0A0A]">
              Kinmel<span className="text-[#E63946]">®</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-[1.5] text-[#0A0A0A]/70">
              Goods curated. Reviews signed. <br className="hidden sm:block" />
              Made to be worn. Or judged. Or both.
            </p>
          </div>

          <div className="lg:col-span-5 lg:pt-4 flex flex-col gap-3 lg:items-end">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#0A0A0A]/45">
              ◆ Specimen No. KM26 · Issue 001
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Link
                href={ROUTES.products}
                className="group inline-flex items-center justify-center px-6 h-11 bg-[#0A0A0A] text-white font-mono text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-[#E63946] transition-colors"
              >
                Shop →
              </Link>
              <Link
                href="/verify"
                className="group inline-flex items-center justify-center px-6 h-11 border border-[#0A0A0A] text-[#0A0A0A] font-mono text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-[#0A0A0A] hover:text-white transition-colors"
              >
                Ledger
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Why section */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 border-t border-[#0A0A0A]/10 pt-12">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#E63946]">
              ◆ Why
            </p>
          </div>
          <div className="lg:col-span-10">
            <p className="font-sans font-medium text-[clamp(1.25rem,2.4vw,1.75rem)] leading-[1.3] tracking-[-0.01em] text-[#0A0A0A] max-w-4xl">
              Most online stores let anyone post a review. Anonymous five-stars from
              accounts created yesterday. Deleted complaints. Vendors paying for praise.
              <span className="text-[#0A0A0A]/40"> Kinmel makes that impossible. </span>
              Every review here is signed by the buyer who placed the order — cryptographically,
              permanently, in public.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
