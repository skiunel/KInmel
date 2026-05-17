'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Shield, ArrowRight, Star, Lock, CheckCircle2, Zap, Globe } from 'lucide-react';
import { motion, type Variants, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useFeaturedProducts } from '@/hooks/use-products';
import { ROUTES } from '@/lib/constants';
import { getEditorialImage } from '@/lib/editorial';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

const fallback = '/editorial-gallery.png';
function img(p: Product | undefined, i = 0) {
  return p ? getEditorialImage(p, i) : fallback;
}

const BRANDS = ['Ethereum', 'Polygon', 'Solana', 'Arbitrum', 'Chainlink', 'Alchemy'];

/* ─── Animated counter ─── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran.current) {
        ran.current = true;
        const start = performance.now();
        const dur = 2000;
        const tick = (now: number) => {
          const t = Math.min((now - start) / dur, 1);
          setN(Math.floor((1 - Math.pow(1 - t, 3)) * target));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════
   HORIZONTAL SCROLL HERO  (GSAP ScrollTrigger)
   ═══════════════════════════════════════════ */
function HeroSection({ products }: { products: Product[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* GSAP horizontal pin */
  useEffect(() => {
    if (mobile || typeof window === 'undefined') return;
    let ctx: { revert: () => void } | undefined;

    (async () => {
      try {
        const { gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        gsap.registerPlugin(ScrollTrigger);

        const wrap = wrapRef.current;
        const track = trackRef.current;
        if (!wrap || !track) return;

        const getTotalScroll = () => Math.max(0, track.scrollWidth - window.innerWidth);
        if (getTotalScroll() === 0) return;

        ctx = gsap.context(() => {
          gsap.to(track, {
            x: () => -getTotalScroll(),
            ease: 'none',
            scrollTrigger: {
              trigger: wrap,
              pin: true,
              scrub: 1,
              end: () => `+=${getTotalScroll()}`,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
              },
            },
          });
        }, wrap);
      } catch { /* GSAP not available — content stays visible */ }
    })();

    return () => { ctx?.revert(); };
  }, [mobile]);

  if (mobile) return <MobileHero products={products} />;

  return (
    <>
      <div ref={barRef} className="scroll-progress" style={{ transform: 'scaleX(0)' }} />

      <div ref={wrapRef} className="h-scroll-wrapper relative">
        <div ref={trackRef} className="h-scroll-track relative z-10">

          {/* ── Panel 1: Headline ── */}
          <section className="h-panel">
            <div className="relative z-10 max-w-2xl text-center bg-white/40 p-10 rounded-3xl backdrop-blur-md border border-white/60 shadow-xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#16a34a]/20 bg-white/80 backdrop-blur-md text-xs text-[#16a34a] font-medium mb-8 shadow-sm">
                <Shield className="w-3.5 h-3.5" />
                Blockchain-verified reviews
              </div>
              <h1 className="font-heading text-5xl sm:text-6xl md:text-[76px] font-extrabold leading-[0.95] tracking-[-0.03em]">
                Every review is<br />
                <span className="text-[#16a34a]">on-chain</span> verified
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-[#71717a] max-w-md mx-auto">
                The first e-commerce platform where every product review is permanently recorded on the blockchain. No fakes, ever.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link href={ROUTES.products} className="btn-primary gap-2">
                  Browse products <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="#how" className="btn-ghost bg-white/50 backdrop-blur-md">How it works</Link>
              </div>
            </div>
          </section>

          {/* ── Panel 2: Product showcase ── */}
          <section className="h-panel">
            <div className="max-w-4xl w-full">
              <div className="card p-6 md:p-8 bg-white/60 backdrop-blur-xl border-white/60 shadow-2xl">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  <span className="ml-3 font-mono text-xs text-[#a1a1aa]">kinmel — verified store</span>
                </div>
                <div className="grid grid-cols-3 gap-4" style={{ height: 'min(50vh, 380px)' }}>
                  {products.slice(0, 3).map((p, i) => (
                    <div key={p._id || i} className="relative rounded-xl overflow-hidden bg-[#f4f4f5] border border-[#e4e4e7] group">
                      <Image src={img(p, i)} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="font-heading text-sm font-bold text-[#18181B] truncate">{p.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex">{[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-[#f59e0b] text-[#f59e0b]" />)}</div>
                          <Lock className="w-3 h-3 text-[#16a34a]" />
                        </div>
                        <p className="mt-1 font-mono text-xs text-[#16a34a] font-medium">{formatPrice(p.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Panel 3: Social proof ── */}
          <section className="h-panel">
            <div className="max-w-xl text-center bg-white/40 p-10 rounded-3xl backdrop-blur-md border border-white/60 shadow-xl">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#a1a1aa] mb-4">Trusted by teams worldwide</p>
              <h2 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight">
                <Counter target={20000} suffix="+" />
              </h2>
              <p className="mt-2 text-lg text-[#71717a]">verified reviews on-chain</p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
                {BRANDS.map(b => (
                  <span key={b} className="font-heading text-xl font-bold text-[#d4d4d8] hover:text-[#16a34a] transition-colors cursor-default">{b}</span>
                ))}
              </div>
            </div>
          </section>

          {/* ── Panel 4: Feature cards ── */}
          <section className="h-panel" id="how">
            <div className="max-w-5xl w-full">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#a1a1aa] mb-3">Why Kinmel</p>
              <h2 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight mb-10">
                Built on <span className="text-[#16a34a]">trust</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { icon: Shield, title: 'Blockchain verified', desc: 'Every review is permanently recorded on-chain. Immutable, transparent, tamper-proof.' },
                  { icon: Zap, title: 'Lightning fast', desc: 'Built on Next.js with edge infrastructure. Sub-second page loads everywhere.' },
                  { icon: Globe, title: 'Open & transparent', desc: 'Review verification is publicly auditable. Anyone can verify authenticity on-chain.' },
                ].map((f) => (
                  <div key={f.title} className="card-hover p-6 bg-white/60 backdrop-blur-xl border-white/60">
                    <div className="w-10 h-10 rounded-xl bg-[#16a34a]/10 flex items-center justify-center mb-4">
                      <f.icon className="w-5 h-5 text-[#16a34a]" />
                    </div>
                    <h3 className="font-heading text-base font-bold tracking-tight">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#71717a]">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}

/* ── Mobile fallback ── */
function MobileHero({ products }: { products: Product[] }) {
  return (
    <div className="relative pt-24 pb-12 px-5 min-h-screen">
      <div className="relative z-10 text-center py-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#16a34a]/20 bg-white/80 backdrop-blur-md text-xs text-[#16a34a] mb-6 shadow-sm">
          <Shield className="w-3.5 h-3.5" />
          Blockchain-verified reviews
        </div>
        <h1 className="font-heading text-4xl font-extrabold leading-[0.95] tracking-[-0.03em]">
          Every review is<br /><span className="text-[#16a34a]">on-chain</span> verified
        </h1>
        <p className="mt-5 text-sm text-[#71717a] max-w-xs mx-auto">No fake reviews. Every rating is permanently recorded on the blockchain.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href={ROUTES.products} className="btn-primary !text-xs !px-5 !py-2.5">Browse</Link>
          <Link href="#how" className="btn-ghost bg-white/50 backdrop-blur-md !text-xs !px-5 !py-2.5">How it works</Link>
        </div>
      </div>
      <div className="relative z-10 grid grid-cols-2 gap-3">
        {products.slice(0, 4).map((p, i) => (
          <Link key={p._id || i} href={ROUTES.product(p.slug)} className="group">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[#e4e4e7] bg-[#f4f4f5]">
              <Image src={img(p, i)} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="font-heading text-xs font-bold text-[#18181B] truncate">{p.name}</p>
                <p className="font-mono text-[10px] text-[#16a34a] mt-0.5">{formatPrice(p.price)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Logo Marquee ── */
function Marquee() {
  return (
    <section className="overflow-hidden border-y border-white/40 py-10 bg-white/20 backdrop-blur-md">
      <p className="text-center font-mono text-[11px] uppercase tracking-[0.25em] text-[#a1a1aa] mb-6">
        Powered by leading blockchain networks
      </p>
      <div className="flex overflow-hidden whitespace-nowrap">
        <div className="marquee-track">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span key={i} className="font-heading text-2xl md:text-3xl font-extrabold text-[#e4e4e7] hover:text-[#16a34a] transition-colors cursor-default">{b}</span>
          ))}
        </div>
        <div className="marquee-track" aria-hidden>
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span key={i} className="font-heading text-2xl md:text-3xl font-extrabold text-[#e4e4e7] hover:text-[#16a34a] transition-colors cursor-default">{b}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Product Grid ── */
function Products({ products }: { products: Product[] }) {
  if (!products.length) return null;
  
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
  };

  return (
    <section className="py-24 px-6 md:px-12 bg-white/30 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="flex items-end justify-between mb-10"
      >
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#a1a1aa] mb-2">Featured</p>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight">Curated collection</h2>
        </div>
        <Link href={ROUTES.products} className="text-sm text-[#16a34a] hover:underline underline-offset-4 font-medium hidden md:block">View all →</Link>
      </motion.div>
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5"
      >
        {products.slice(0, 10).map((p, i) => (
          <motion.div key={p._id || i} variants={item}>
            <Link href={ROUTES.product(p.slug)} className="group block card-hover overflow-hidden h-full flex flex-col">
              <div className="relative aspect-[4/5] bg-[#f4f4f5]">
                <Image src={img(p, i)} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 text-[10px] text-[#16a34a] font-medium border border-[#e4e4e7] shadow-sm">
                  <Lock className="w-3 h-3" /> Verified
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="font-heading text-[13px] sm:text-sm font-bold tracking-tight group-hover:text-[#16a34a] transition-colors line-clamp-2">{p.name}</h3>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-2.5 h-2.5 fill-[#f59e0b] text-[#f59e0b]" />)}
                  </div>
                  <span className="font-mono text-xs sm:text-sm font-medium text-[#16a34a]">{formatPrice(p.price)}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ── How it works ── */
function HowItWorks() {
  const steps = [
    { n: '01', title: 'Purchase a product', desc: 'Browse our curated collection and complete your purchase through our secure checkout.' },
    { n: '02', title: 'Leave a review', desc: 'Share your honest experience. Your review is submitted for blockchain verification.' },
    { n: '03', title: 'Verified on-chain', desc: 'Your review is permanently recorded on the blockchain — immutable and publicly verifiable.' },
  ];

  return (
    <section className="py-24 px-6 md:px-12 bg-white/40 backdrop-blur-md border-y border-white/40" id="how">
      <div className="max-w-4xl mx-auto">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#a1a1aa] mb-3 text-center">How it works</p>
        <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-14">
          Three steps to <span className="text-[#16a34a]">verified trust</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="card p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#16a34a]/10 flex items-center justify-center mx-auto mb-5">
                <span className="font-heading text-lg font-extrabold text-[#16a34a]">{s.n}</span>
              </div>
              <h3 className="font-heading text-base font-bold tracking-tight">{s.title}</h3>
              <p className="mt-3 text-sm text-[#71717a] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
function Testimonials() {
  const items = [
    { q: 'Finally, reviews I can actually trust. The blockchain verification gives me complete confidence in every purchase.', name: 'Sarah C.', role: 'Designer' },
    { q: 'No more fake reviews — this is how e-commerce should work. Transparent, honest, and beautifully designed.', name: 'Marcus W.', role: 'Engineer' },
    { q: 'The verification badge next to each review means something real. Love this approach to building trust.', name: 'Aiko T.', role: 'Product Manager' },
  ];

  return (
    <section className="py-24 px-6 md:px-12">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#a1a1aa] mb-3 text-center">Testimonials</p>
      <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-12">
        Loved by <span className="text-[#16a34a]">real people</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {items.map(t => <TiltCard key={t.name} {...t} />)}
      </div>
    </section>
  );
}

function TiltCard({ q, name, role }: { q: string; name: string; role: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const c = ref.current; if (!c) return;
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    c.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-3px)`;
  }, []);
  const leave = useCallback(() => { if (ref.current) ref.current.style.transform = 'none'; }, []);

  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave} className="card p-6 transition-all duration-300 cursor-default hover:shadow-lg hover:border-[rgba(22,163,74,0.2)]" style={{ willChange: 'transform' }}>
      <div className="flex gap-0.5 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />)}</div>
      <p className="text-sm leading-relaxed text-[#3f3f46]">&ldquo;{q}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#16a34a]/10 flex items-center justify-center">
          <span className="font-heading text-xs font-bold text-[#16a34a]">{name[0]}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#18181B]">{name}</p>
          <p className="text-xs text-[#a1a1aa]">{role}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Blockchain Verification Section ── */
function BlockchainVerification() {
  return (
    <section className="py-24 px-6 md:px-12 bg-white/30 backdrop-blur-md border-y border-white/40" id="blockchain">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#a1a1aa] mb-3">Blockchain Technology</p>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight">
            Powered by <span className="text-[#16a34a]">immutable</span> infrastructure
          </h2>
          <p className="mt-4 text-sm text-[#71717a] max-w-lg mx-auto">Every review goes through a multi-layer verification pipeline — from purchase confirmation to on-chain proof anchoring.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* IPFS Storage */}
          <div className="card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#16a34a]/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-[#16a34a]/10 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-[#16a34a]" />
              </div>
              <h3 className="font-heading text-lg font-bold tracking-tight">IPFS Distributed Storage</h3>
              <p className="mt-2 text-sm text-[#71717a] leading-relaxed">Reviews are hashed and pinned to IPFS — a global, decentralized file system. Content is addressable by its cryptographic hash, making tampering detectable.</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16a34a]/8 text-[10px] font-mono text-[#16a34a] font-medium">
                  <Lock className="w-3 h-3" /> SHA-256 Hashing
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16a34a]/8 text-[10px] font-mono text-[#16a34a] font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Content Pinning
                </div>
              </div>
            </div>
          </div>

          {/* On-chain Proof */}
          <div className="card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f59e0b]/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#f59e0b]" />
              </div>
              <h3 className="font-heading text-lg font-bold tracking-tight">On-Chain Proof Anchoring</h3>
              <p className="mt-2 text-sm text-[#71717a] leading-relaxed">A cryptographic proof of each review is anchored to the blockchain with a public timestamp. Anyone can independently verify the integrity of a review.</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f59e0b]/8 text-[10px] font-mono text-[#f59e0b] font-medium">
                  <Zap className="w-3 h-3" /> Smart Contract
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f59e0b]/8 text-[10px] font-mono text-[#f59e0b] font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Public Audit
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification flow diagram */}
        <div className="mt-8 card p-6 md:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a1a1aa] mb-5">Verification Pipeline</p>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {[
              { step: '1', label: 'Purchase Confirmed', sublabel: 'Order delivered' },
              { step: '2', label: 'Review Submitted', sublabel: 'Content hashed' },
              { step: '3', label: 'IPFS Pinned', sublabel: 'CID generated' },
              { step: '4', label: 'On-Chain Anchored', sublabel: 'Tx confirmed' },
              { step: '✓', label: 'Publicly Verifiable', sublabel: 'Anyone can check' },
            ].map((s, i, arr) => (
              <div key={s.step} className="flex items-center gap-3">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${s.step === '✓' ? 'bg-[#16a34a] text-white' : 'bg-[#16a34a]/10 text-[#16a34a]'}`}>
                    {s.step}
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[#18181B]">{s.label}</p>
                  <p className="text-[10px] text-[#a1a1aa]">{s.sublabel}</p>
                </div>
                {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-[#d4d4d8] hidden md:block" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── CTA Banner ── */
function CTA() {
  return (
    <section className="relative py-24 px-6 md:px-12 overflow-hidden bg-white/40 backdrop-blur-md border-y border-white/40">
      <div className="absolute inset-0 bg-gradient-to-br from-[#16a34a]/[0.08] via-transparent to-[#f59e0b]/[0.08]" />
      {[
        { w: 5, l: 12, t: 20, d: '0s', dur: '8s' }, { w: 4, l: 30, t: 60, d: '2s', dur: '10s' },
        { w: 6, l: 55, t: 15, d: '4s', dur: '9s' }, { w: 3, l: 75, t: 70, d: '1s', dur: '7s' },
        { w: 5, l: 90, t: 40, d: '3s', dur: '11s' }, { w: 4, l: 45, t: 85, d: '5s', dur: '8s' },
      ].map((p, i) => (
        <div key={i} className="particle" style={{ width: p.w, height: p.w, left: `${p.l}%`, top: `${p.t}%`, animationDelay: p.d, animationDuration: p.dur }} />
      ))}
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight">
          Ready for reviews<br />you can <span className="text-[#16a34a]">actually trust</span>?
        </h2>
        <p className="mt-5 text-base text-[#71717a] max-w-md mx-auto">
          Join thousands of shoppers who rely on blockchain-verified reviews for confident purchasing decisions.
        </p>
        <div className="mt-9 flex justify-center gap-4">
          <Link href={ROUTES.register} className="btn-primary gap-2">Get started <ArrowRight className="w-4 h-4" /></Link>
          <Link href={ROUTES.products} className="btn-ghost">Browse products</Link>
        </div>
      </div>
    </section>
  );
}

/* ═══ MAIN ═══ */
export function EditorialHome() {
  const { data: products = [] } = useFeaturedProducts(10);
  
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { damping: 30, stiffness: 100 });
  const springY = useSpring(mouseY, { damping: 30, stiffness: 100 });
  const bgX = useTransform(springX, [0, 1], ['-2%', '2%']);
  const bgY = useTransform(springY, [0, 1], ['-2%', '2%']);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fafaf8]">
      {/* Global Fixed Live Wallpaper Background */}
      <motion.div 
        aria-hidden="true"
        className="fixed inset-[-5%] z-[0] overflow-hidden"
        style={{ x: bgX, y: bgY }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="h-full w-full scale-105 object-cover opacity-[0.78] mix-blend-multiply md:scale-100 md:opacity-[0.85]"
        >
          <source src="/background-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafaf8]/5 via-[#fafaf8]/40 to-[#fafaf8]/80 pointer-events-none" />
      </motion.div>

      <main className="relative z-10">
        <HeroSection products={products} />
        <Marquee />
        <Products products={products} />
        <HowItWorks />
        <Testimonials />
        <BlockchainVerification />
        <CTA />
      </main>
    </div>
  );
}
