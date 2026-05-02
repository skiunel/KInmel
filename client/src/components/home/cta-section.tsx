'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, LayoutPanelTop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { ROUTES } from '@/lib/constants';

export function CTASection() {
  return (
    <section className="py-22 sm:py-24">
      <Container size="narrow">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="surface-panel overflow-hidden px-8 py-10 text-center sm:px-12 sm:py-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <LayoutPanelTop className="size-3.5 text-primary" />
            Catalog ready
          </div>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Bring your catalog into a cleaner, more professional storefront.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Start with products, add your own media, and keep the experience focused on browsing and buying instead of extra noise.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" render={<Link href={ROUTES.register} />}>
              Create account
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href={ROUTES.products} />}>
              Shop now
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
