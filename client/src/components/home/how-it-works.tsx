'use client';

import { motion } from 'framer-motion';
import {
  Bell,
  LayoutDashboard,
  ShoppingBag,
  Smartphone,
  SquareChartGantt,
} from 'lucide-react';
import { Container } from '@/components/layout/container';
import { AnimatedSection } from '@/components/shared';

const surfaces = [
  {
    number: '01',
    icon: ShoppingBag,
    title: 'Landing page',
    description:
      'Big editorial hero, floating product mockup, premium stats, and quiet product storytelling.',
    bullets: ['Gradient-led first impression', 'Glass navigation and cards', 'Whitespace-heavy conversion flow'],
  },
  {
    number: '02',
    icon: LayoutDashboard,
    title: 'Client dashboard',
    description:
      'A brighter member workspace with KPI cards, lightweight insights, recent orders, and activity modules.',
    bullets: ['Sidebar + top utility bar', 'Progress, spend, and activity summaries', 'Clean data tables and status cues'],
  },
  {
    number: '03',
    icon: SquareChartGantt,
    title: 'Admin panel',
    description:
      'Neutral, functional command surface for users, products, orders, analytics, and moderation.',
    bullets: ['Grid-based information hierarchy', 'Modern sortable tables', 'Forms and analytics in one language'],
  },
  {
    number: '04',
    icon: Smartphone,
    title: 'Mobile app',
    description:
      'Thumb-friendly home, product, cart, and profile layouts that preserve the same premium brand feel.',
    bullets: ['Rounded card rhythm', 'Compressed but readable product detail', 'Fast one-hand checkout flow'],
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-22 sm:py-24">
      <Container>
        <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <AnimatedSection className="surface-strong px-6 py-7 sm:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/72 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <Bell className="size-3.5 text-primary" />
              Page-by-page layout structure
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              One ecosystem, four screen families, and a single premium system underneath.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Instead of treating each screen as a separate project, the new UI uses repeated patterns: large type, soft elevation, rounded surfaces, green accent lighting, and consistent data behavior.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="mobile-frame bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(240,248,243,0.94))]">
                <div className="rounded-[1.6rem] bg-[#183a28] p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/60">Mobile home</p>
                  <p className="mt-2 text-lg font-semibold">Curated cards + wellness highlights</p>
                  <div className="mt-4 space-y-2">
                    <div className="rounded-2xl bg-white/10 px-3 py-3 text-sm">Featured ritual set</div>
                    <div className="rounded-2xl bg-white/10 px-3 py-3 text-sm">New arrivals</div>
                    <div className="rounded-2xl bg-white/10 px-3 py-3 text-sm">Profile progress</div>
                  </div>
                </div>
              </div>

              <div className="mobile-frame">
                <div className="rounded-[1.6rem] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(53,121,83,0.08)]">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Product detail</p>
                  <div className="mt-4 h-34 rounded-[1.4rem] bg-[linear-gradient(135deg,#d9eddc,#f5f9f5)]" />
                  <div className="mt-4 h-3 w-3/4 rounded-full bg-slate-200" />
                  <div className="mt-2 h-3 w-1/2 rounded-full bg-slate-200" />
                  <div className="mt-4 grid gap-2">
                    <div className="rounded-2xl bg-slate-50 px-3 py-3 text-sm">Trust cues</div>
                    <div className="rounded-2xl bg-[#183a28] px-3 py-3 text-sm text-white">Add to cart</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <div className="grid gap-4 sm:grid-cols-2">
            {surfaces.map((surface, index) => (
              <motion.div
                key={surface.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: index * 0.05, duration: 0.42 }}
                className="surface-panel p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <surface.icon className="size-5" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {surface.number}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
                  {surface.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {surface.description}
                </p>

                <div className="mt-5 space-y-2">
                  {surface.bullets.map((item) => (
                    <div key={item} className="surface-subtle px-4 py-3 text-sm text-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
