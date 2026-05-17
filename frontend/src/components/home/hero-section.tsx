'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ROUTES } from '@/lib/constants';

const VIDEO_SOURCES = [
  'https://videos.pexels.com/video-files/5319754/5319754-hd_1920_1080_25fps.mp4',
  'https://videos.pexels.com/video-files/5319734/5319734-hd_1920_1080_25fps.mp4',
  'https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4',
];

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = 0.75;
    v.play().catch(() => {});
  }, []);

  return (
    <>
      {/* Fullscreen video hero */}
      <section className="relative h-screen w-full overflow-hidden bg-[#0A0A0A]">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setLoaded(true)}
          poster="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        >
          {VIDEO_SOURCES.map((src) => (
            <source key={src} src={src} type="video/mp4" />
          ))}
        </video>

        {/* Gradient overlays for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 via-transparent to-[#0A0A0A]/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/50 via-transparent to-transparent" />

        {/* Top meta strip */}
        <div className="absolute top-0 inset-x-0 z-10 pt-20">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-12 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-white/70">
            <span>K / 2026 / SS</span>
            <span className="hidden md:inline">Specimen No. KM26 · Issue 001</span>
            <span>KTM · LA</span>
          </div>
        </div>

        {/* Centered headline */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end pb-14 lg:pb-20">
          <div className="max-w-[1600px] mx-auto w-full px-6 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="grid lg:grid-cols-12 gap-8 items-end"
            >
              <div className="lg:col-span-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#E63946] mb-5">
                  ◆ Goods curated, reviews signed
                </p>
                <h1 className="font-sans font-black uppercase tracking-[-0.04em] leading-[0.88] text-[clamp(3.5rem,11vw,11rem)] text-white">
                  Kinmel<span className="text-[#E63946]">®</span>
                </h1>
                <p className="mt-6 max-w-md text-[14px] leading-[1.55] text-white/75">
                  Made to be worn. Or judged. Or both.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-wrap gap-3 lg:justify-end">
                <Link
                  href={ROUTES.products}
                  className="inline-flex items-center justify-center px-7 h-12 bg-white text-[#0A0A0A] font-mono text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-[#E63946] hover:text-white transition-colors"
                >
                  Enter shop →
                </Link>
                <Link
                  href="/verify"
                  className="inline-flex items-center justify-center px-7 h-12 border border-white/40 text-white font-mono text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-white hover:text-[#0A0A0A] transition-colors backdrop-blur-sm"
                >
                  Public ledger
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/55">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-white/60 to-transparent" />
        </div>
      </section>

      {/* Why block beneath video */}
      <section className="relative bg-white border-b border-[#0A0A0A]/10 py-20 lg:py-28">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#E63946]">
                ◆ Why
              </p>
            </div>
            <div className="lg:col-span-9">
              <p className="font-sans font-medium text-[clamp(1.25rem,2.6vw,2rem)] leading-[1.3] tracking-[-0.01em] text-[#0A0A0A] max-w-4xl">
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
    </>
  );
}
