'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { ROUTES } from '@/lib/constants';

export function HeroSection() {
  return (
    <section
      id="about"
      className="relative -mt-[8.75rem] min-h-screen overflow-hidden bg-[linear-gradient(135deg,#09090b_0%,#16090b_34%,#450a0a_68%,#991b1b_100%)] pt-[11rem] text-white sm:pt-[11.5rem] lg:pt-[12rem]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_18%),radial-gradient(circle_at_82%_22%,rgba(217,45,45,0.24),transparent_16%),linear-gradient(90deg,rgba(0,0,0,0.44)_0%,rgba(0,0,0,0.16)_38%,rgba(255,255,255,0)_72%)]" />
      <div className="hero-orb -left-20 top-24 size-80 bg-primary/18" />
      <div className="hero-orb right-0 top-4 size-96 bg-red-300/10" />
      <div className="hero-orb left-1/3 bottom-10 size-96 bg-white/4" />

      <Container className="relative flex min-h-[calc(100vh-2rem)] max-w-[88rem] items-center">
        <div className="grid w-full gap-12 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl pb-10 lg:pb-24"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/76 backdrop-blur-xl">
              <Sparkles className="size-3.5" />
              Wellness eCommerce
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-[5.4rem] lg:leading-[0.9]">
              The power of
              <br />
              clean wellness
              <br />
              in every dose.
            </h1>

            <p className="mt-6 max-w-md text-sm leading-7 text-white/82 sm:text-base">
              Discover modern nutrition, recovery, and daily wellness products in a storefront built with premium hierarchy, generous space, and effortless shopping flow.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                render={<Link href={ROUTES.products} />}
                className="bg-slate-950 text-white shadow-[0_22px_38px_rgba(8,17,12,0.24)]"
              >
                Explore now
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[40rem] pb-4 pt-6 lg:pb-16">
              <div className="absolute left-1/2 top-8 h-[78%] w-[78%] -translate-x-1/2 rounded-full bg-white/20 blur-[90px]" />

              <motion.div
                animate={{ y: [0, -8, 0], rotate: [-8, -6.5, -8] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="relative mx-auto w-[88%] max-w-[31rem]"
              >
                <div className="absolute inset-x-[10%] bottom-6 h-12 rounded-full bg-black/40 blur-2xl" />
                <div className="relative overflow-hidden rounded-[2.8rem] border border-white/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,255,255,0.12))] p-6 shadow-[0_38px_90px_rgba(8,17,12,0.28)] backdrop-blur-xl">
                  <div className="absolute right-5 top-5 rounded-full border border-white/30 bg-white/26 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
                    Best seller
                  </div>

                  <div className="relative aspect-[4/4.7] overflow-hidden rounded-[2.2rem] bg-[linear-gradient(180deg,#1a1a1f_0%,#2b0f12_100%)]">
                    <Image
                      src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80"
                      alt="Premium wellness bottle product mockup"
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 1024px) 80vw, 38vw"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 text-white">
                    <div>
                      <p className="text-sm font-semibold">TerraElix Daily Blend</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/65">
                        Clean daily support
                      </p>
                    </div>
                    <div className="rounded-full border border-white/24 bg-white/10 px-3 py-1.5 text-sm font-semibold">
                      Rs. 4,800
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="absolute left-0 top-12 hidden rounded-[1.45rem] border border-white/18 bg-white/10 p-4 text-white shadow-[0_18px_45px_rgba(8,17,12,0.18)] backdrop-blur-xl md:block">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="size-4 text-red-200" />
                  Daily support
                </div>
                <p className="mt-2 max-w-[11rem] text-sm leading-6 text-white/72">
                  Clean blends designed for calm energy and better routines.
                </p>
              </div>

              <div className="absolute bottom-8 right-0 hidden rounded-[1.45rem] border border-white/18 bg-white/10 p-4 text-white shadow-[0_18px_45px_rgba(8,17,12,0.18)] backdrop-blur-xl md:block">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="size-4 text-red-200" />
                  Verified trust
                </div>
                <p className="mt-2 max-w-[12rem] text-sm leading-6 text-white/72">
                  Reviews remain blockchain-verified while the storefront stays beautifully minimal.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
