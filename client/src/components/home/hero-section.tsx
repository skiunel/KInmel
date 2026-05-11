'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col bg-[#0B0B0D] overflow-hidden pt-24">
      {/* Top meta strip */}
      <div className="relative z-10 border-b border-[#EDE7DA]/8">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-12 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.28em] text-[#EDE7DA]/45">
          <span>K / 2026 / SS</span>
          <span className="hidden md:inline">Issue 001 — Trusted Goods</span>
          <span>KTM · LA</span>
        </div>
      </div>

      {/* Main */}
      <div className="relative z-10 flex-1 grid lg:grid-cols-12 gap-0">
        {/* Left: oversized type */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-8 flex flex-col justify-between px-6 lg:px-10 py-16 lg:py-24 border-r border-[#EDE7DA]/8"
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#FF3D00] mb-8">
              ◆ 001 / Trusted Goods
            </p>
            <h1 className="font-heading font-black uppercase leading-[0.86] tracking-[-0.05em] text-[#EDE7DA] text-[clamp(3.5rem,10vw,9rem)]">
              Objects
              <br />
              <span className="text-[#FF3D00]">worth</span>
              <br />
              <span className="italic font-light tracking-[-0.04em]">keeping.</span>
            </h1>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-10 lg:max-w-3xl">
            <p className="text-[15px] leading-[1.6] text-[#EDE7DA]/65 max-w-md">
              A small catalogue of objects worth keeping. Every review attached to one
              is signed by the buyer, witnessed publicly, and impossible to silently rewrite.
            </p>
            <div className="flex flex-col gap-2 md:items-start">
              <Link
                href={ROUTES.products}
                className="group inline-flex items-center justify-between gap-6 px-6 h-14 bg-[#FF3D00] text-[#0B0B0D] font-mono text-[11px] font-bold uppercase tracking-[0.24em] hover:bg-[#EDE7DA] transition-colors w-full md:w-[280px]"
              >
                Enter Catalogue
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/verify"
                className="group inline-flex items-center justify-between gap-6 px-6 h-14 border border-[#EDE7DA]/15 text-[#EDE7DA] font-mono text-[11px] font-bold uppercase tracking-[0.24em] hover:border-[#FF3D00] hover:text-[#FF3D00] transition-colors w-full md:w-[280px]"
              >
                The Ledger
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Right: image stack */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="lg:col-span-4 relative bg-[#0F0F12] hidden lg:block"
        >
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=85"
              alt=""
              fill
              unoptimized
              className="object-cover grayscale contrast-110"
              sizes="33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0D]/40 via-transparent to-[#0B0B0D]/90" />
          </div>

          {/* Tag */}
          <div className="absolute top-8 left-8 right-8 flex items-start justify-between text-[10px] font-mono uppercase tracking-[0.24em] text-[#EDE7DA]/85">
            <span>◆ ITEM N°001</span>
            <span>NPR 8,999</span>
          </div>

          {/* Caption */}
          <div className="absolute bottom-10 left-8 right-8">
            <p className="font-heading text-2xl font-black uppercase tracking-tight text-[#EDE7DA] leading-tight">
              Premium<br />Headphones
            </p>
            <p className="mt-3 text-[10px] font-mono uppercase tracking-[0.24em] text-[#EDE7DA]/55">
              42 signed reviews · 4.8 / 5
            </p>
          </div>

          {/* Vertical rule */}
          <div className="absolute top-1/2 -translate-y-1/2 left-8 font-mono text-[9px] uppercase tracking-[0.4em] text-[#EDE7DA]/35" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg) translateY(50%)' }}>
            Verified · Permanent · Public
          </div>
        </motion.div>
      </div>

      {/* Bottom strip: stats */}
      <div className="relative z-10 border-t border-[#EDE7DA]/8">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-6 grid grid-cols-3 lg:grid-cols-4 gap-6">
          <Stat n="12,847" label="Signed reviews" />
          <Stat n="2,341" label="Objects in stock" />
          <Stat n="8,529" label="Verified buyers" />
          <Stat n="0" label="Fakes ever found" hide />
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label, hide }: { n: string; label: string; hide?: boolean }) {
  return (
    <div className={hide ? 'hidden lg:block' : ''}>
      <p className="font-heading text-3xl md:text-4xl font-black tracking-tight text-[#EDE7DA]">{n}</p>
      <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.24em] text-[#EDE7DA]/40">
        {label}
      </p>
    </div>
  );
}
