'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock3,
  Boxes,
  GalleryHorizontal,
  PackageCheck,
  ShieldPlus,
  ShoppingBasket,
} from 'lucide-react';
import { Container } from '@/components/layout/container';
import { AnimatedSection } from '@/components/shared';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const categories = [
  {
    name: 'Best Sellers',
    icon: ShoppingBasket,
    count: '24 products',
    note: 'Top-performing items presented with stronger imagery, price hierarchy, and cleaner call-to-action blocks.',
    tone: 'bg-primary/10 text-primary',
  },
  {
    name: 'New Arrivals',
    icon: ShieldPlus,
    count: '18 items',
    note: 'Fresh additions for customers who want to browse the latest catalog updates first.',
    tone: 'bg-chain/10 text-teal-700',
  },
  {
    name: 'Bundles',
    icon: Boxes,
    count: '16 sets',
    note: 'Curated multi-product sets for higher average order value and easier discovery.',
    tone: 'bg-verified/15 text-amber-700',
  },
  {
    name: 'Daily Essentials',
    icon: PackageCheck,
    count: '22 items',
    note: 'Core catalog products organized for repeat buyers and quick reordering.',
    tone: 'bg-success/15 text-emerald-700',
  },
  {
    name: 'Limited Drops',
    icon: Clock3,
    count: '14 releases',
    note: 'Time-sensitive products and special releases grouped for faster conversion.',
    tone: 'bg-info/12 text-sky-700',
  },
  {
    name: 'Editorial Features',
    icon: GalleryHorizontal,
    count: '12 highlights',
    note: 'Collection stories, spotlight rows, and campaign-led groupings for featured products.',
    tone: 'bg-secondary text-foreground',
  },
] as const;

export function FeaturedCategories() {
  return (
    <section id="categories" className="py-22 sm:py-24">
      <Container>
        <AnimatedSection>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Shop by category
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Organize the catalog in a way customers can scan fast.
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Build the storefront around best sellers, new arrivals, bundles, and featured drops instead of long unstructured product lists.
              </p>
            </div>

            <Link
              href={ROUTES.products}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              See all products
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </AnimatedSection>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <Link
                href={ROUTES.products}
                className="surface-panel group flex h-full flex-col justify-between p-5 transition-transform duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={cn('rounded-2xl p-3', category.tone)}>
                    <category.icon className="size-5" />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {category.count}
                  </span>
                </div>

                <div className="mt-8">
                  <p className="text-xl font-semibold tracking-tight text-foreground">
                    {category.name}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {category.note}
                  </p>
                </div>

                <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  Shop now
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
