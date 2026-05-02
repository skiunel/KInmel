'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  ImageIcon,
  Package,
  UserRound,
} from 'lucide-react';
import { Container } from '@/components/layout/container';
import { AnimatedSection } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

const imageSlots = [
  {
    title: 'Founder or team photo',
    note: 'Use this slot for a portrait, team image, or brand owner shot.',
    icon: UserRound,
    aspect: 'aspect-[4/4.4]',
  },
  {
    title: 'Product close-up',
    note: 'Add a packaging detail, texture shot, or product-in-hand image.',
    icon: Package,
    aspect: 'aspect-[4/3]',
  },
  {
    title: 'Storefront banner',
    note: 'Drop in a shelf, campaign, or collection image to complete the story.',
    icon: Building2,
    aspect: 'aspect-[4/3]',
  },
] as const;

export function StoreProfileSection() {
  return (
    <section id="store-profile" className="py-22 sm:py-24">
      <Container>
        <AnimatedSection className="surface-strong overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
          <div className="grid gap-10 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
            <div className="max-w-xl">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Store profile
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                A professional brand block with room for your own images.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                This section is built so you can plug in your own portrait, product photography, and campaign visuals without breaking the layout.
              </p>

              <div className="mt-8 grid gap-3">
                {[
                  'Large media areas for sharper brand presentation',
                  'Balanced text and image spacing that still feels editorial',
                  'Clean placeholders you can replace later with final assets',
                ].map((item) => (
                  <div
                    key={item}
                    className="surface-subtle flex items-center gap-3 px-4 py-3 text-sm text-foreground"
                  >
                    <span className="size-2 rounded-full bg-primary" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" render={<Link href={ROUTES.products} />}>
                  Explore products
                  <ArrowRight className="size-4" />
                </Button>
                <Button size="lg" variant="outline" render={<Link href="/#site-footer" />}>
                  Contact store
                </Button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4 }}
                className="surface-panel flex flex-col p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">Main brand media</p>
                  <span className="rounded-full border border-border/80 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Replace later
                  </span>
                </div>

                <div className="mt-4 flex aspect-[4/4.1] flex-col items-center justify-center rounded-[1.9rem] border border-dashed border-border/80 bg-[linear-gradient(180deg,rgba(245,248,242,0.98),rgba(233,239,229,0.92))] px-6 text-center">
                  <div className="inline-flex rounded-full border border-border/70 bg-white/85 p-4 text-primary">
                    <ImageIcon className="size-7" />
                  </div>
                  <p className="mt-5 text-xl font-semibold tracking-tight text-foreground">
                    Add your lead image
                  </p>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                    Use this as your hero packshot, founder portrait, or collection image without changing the surrounding layout.
                  </p>
                </div>
              </motion.div>

              <div className="grid gap-4">
                {imageSlots.map((slot, index) => (
                  <motion.div
                    key={slot.title}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ delay: index * 0.05, duration: 0.38 }}
                    className="surface-panel p-4"
                  >
                    <div
                      className={`flex ${slot.aspect} flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-border/80 bg-[linear-gradient(180deg,rgba(249,251,247,0.98),rgba(239,243,235,0.9))] px-4 text-center`}
                    >
                      <div className="inline-flex rounded-full border border-border/70 bg-white/88 p-3 text-primary">
                        <slot.icon className="size-5" />
                      </div>
                      <p className="mt-4 text-base font-semibold text-foreground">{slot.title}</p>
                      <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                        {slot.note}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}
