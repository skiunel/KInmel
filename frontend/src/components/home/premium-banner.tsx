'use client';

import { motion } from 'framer-motion';
import { Check, Palette, Type, WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';

const palette = [
  { name: 'Forest', swatch: 'bg-[#183a28]' },
  { name: 'Primary green', swatch: 'bg-[#357953]' },
  { name: 'Soft mint', swatch: 'bg-[#c6f0d0]' },
  { name: 'Warm sand', swatch: 'bg-[#f2ddac]' },
] as const;

export function PremiumBanner() {
  return (
    <section id="design-system" className="py-22 sm:py-24">
      <Container>
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-[2rem] border border-[#183a28]/10 bg-[linear-gradient(135deg,#173929_0%,#265d42_52%,#6bbc86_124%)] p-7 text-white shadow-[0_32px_80px_rgba(24,58,40,0.18)]"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/72">
              <WandSparkles className="size-3.5" />
              Design system
            </div>

            <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              The premium feel comes from the system, not from isolated pretty screens.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/78">
              Colors, typography, cards, and buttons are now tuned to a wellness-luxury aesthetic so every product page, dashboard module, and admin table feels related.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              {palette.map((item) => (
                <div key={item.name} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3">
                  <div className={`h-16 rounded-[1rem] ${item.swatch}`} />
                  <p className="mt-3 text-sm font-medium text-white">{item.name}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="surface-panel p-6"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Type className="size-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-foreground">Typography</p>
                  <p className="text-sm text-muted-foreground">Large editorial headlines paired with clean, legible utility text.</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <p className="text-4xl font-semibold tracking-tight text-foreground">Clarity that still feels luxurious.</p>
                <p className="text-sm leading-7 text-muted-foreground">The system favors bold headings, grounded body copy, and short labels that scan quickly in both shopping and data-heavy surfaces.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="surface-panel p-6"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Palette className="size-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-foreground">Buttons and cards</p>
                  <p className="text-sm text-muted-foreground">Rounded controls, soft shadows, and layered glass surfaces.</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button size="lg">Primary action</Button>
                <Button size="lg" variant="outline">Secondary action</Button>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {['Outline iconography', 'Soft depth and blur', 'Consistent green accent', 'Neutral data surfaces'].map((item) => (
                  <div key={item} className="surface-subtle flex items-center gap-3 px-4 py-3 text-sm text-foreground">
                    <Check className="size-4 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
