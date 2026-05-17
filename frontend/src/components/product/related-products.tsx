'use client';

import { useProducts } from '@/hooks/use-products';
import { ProductCard } from './product-card';
import { ProductGridSkeleton } from '@/components/shared/loading-skeleton';
import { AnimatedSection } from '@/components/shared';

interface RelatedProductsProps {
  categorySlug: string;
  currentProductId: string;
}

export function RelatedProducts({ categorySlug, currentProductId }: RelatedProductsProps) {
  const { data, isLoading } = useProducts({
    category: categorySlug,
    limit: 4,
  });

  const products = data?.data.filter((p) => p._id !== currentProductId).slice(0, 4) || [];

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="mt-16">
      <AnimatedSection>
        <h2 className="mb-8 text-xl font-bold text-foreground font-heading">
          You may also like
        </h2>
      </AnimatedSection>

      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, i) => (
            <AnimatedSection key={product._id} delay={i * 0.08}>
              <ProductCard
                product={{
                  ...product,
                  compareAtPrice: product.compareAtPrice ?? undefined,
                  totalReviews: product.reviewCount,
                  category: typeof product.category === 'object' ? product.category : undefined,
                }}
              />
            </AnimatedSection>
          ))}
        </div>
      )}
    </section>
  );
}
