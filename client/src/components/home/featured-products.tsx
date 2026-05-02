'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { AnimatedSection, ProductGridSkeleton } from '@/components/shared';
import { ProductCard } from '@/components/product';
import { ROUTES } from '@/lib/constants';
import { productService } from '@/services/product.service';
import type { Product } from '@/types';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productService
      .getFeatured(4)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section id="featured-products" className="py-22 sm:py-24">
      <Container>
        <AnimatedSection className="surface-strong overflow-hidden px-6 py-8 sm:px-8">
          <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Featured products
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Products presented with stronger hierarchy and cleaner decision points.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                The card system keeps imagery, pricing, and actions aligned so customers can compare faster and move to checkout with less friction.
              </p>

              <div className="mt-6 grid gap-3">
                {[
                  'Large product imagery with room for better packshots',
                  'Clear pricing and product details for faster comparison',
                  'Consistent browse-to-cart flow with less visual noise',
                ].map((item) => (
                  <div key={item} className="surface-subtle flex items-center gap-3 px-4 py-3 text-sm text-foreground">
                    <span className="size-2 rounded-full bg-primary" />
                    {item}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                render={<Link href={ROUTES.products} />}
                className="mt-8"
              >
                Explore all products
                <ArrowRight className="size-4" />
              </Button>
            </div>

            <div>
              <div className="mb-5 grid gap-3 md:grid-cols-3">
                {[
                  { label: 'Visual direction', value: 'Editorial and structured' },
                  { label: 'Card system', value: 'Clean and consistent' },
                  { label: 'Shopping speed', value: 'Fast and simple' },
                ].map((item) => (
                  <div key={item.label} className="surface-subtle px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>

              <div>
            {isLoading ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}
