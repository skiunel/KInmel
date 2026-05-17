'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ROUTES } from '@/lib/constants';
import { productService } from '@/services/product.service';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productService
      .getFeatured(8)
      .then(setProducts)
      .catch((e) => setError(e?.message || 'failed'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="bg-white py-16 lg:py-24 border-b border-[#0A0A0A]/10">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
        {/* Section header */}
        <div className="grid lg:grid-cols-12 gap-8 mb-12 items-end">
          <div className="lg:col-span-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#E63946] mb-3">
              ◆ Catalogue
            </p>
            <h2 className="font-sans font-black uppercase tracking-[-0.03em] text-[clamp(2rem,5vw,4rem)] text-[#0A0A0A] leading-[0.95]">
              Selected goods.
            </h2>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Link
              href={ROUTES.products}
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#0A0A0A] hover:text-[#E63946] transition-colors"
            >
              View all →
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#F4F4F4] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="border border-[#0A0A0A]/10 p-16 text-center">
            <p className="font-mono text-xs text-[#E63946] uppercase tracking-widest mb-3">◆ Connection refused</p>
            <p className="text-sm text-[#0A0A0A]/55">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="border border-[#0A0A0A]/10 p-16 text-center text-[#0A0A0A]/45 font-mono text-xs uppercase tracking-widest">
            ◆ Catalogue empty
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product, idx) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
              >
                <OutfitCard product={product} index={idx} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function OutfitCard({ product, index }: { product: Product; index: number }) {
  const imgA = product.images?.[0];
  const imgB = product.images?.[1] ?? product.images?.[0];
  const number = String(index + 1).padStart(2, '0');
  const category = typeof product.category === 'object' ? product.category?.name : null;

  return (
    <Link href={`${ROUTES.products}/${product.slug}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F4F4F4]">
        {imgA ? (
          <>
            <Image
              src={imgA}
              alt={product.name}
              fill
              unoptimized
              className="object-cover transition-opacity duration-500 group-hover:opacity-0"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <Image
              src={imgB}
              alt={product.name}
              fill
              unoptimized
              className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-sans font-black text-7xl text-[#0A0A0A]/10">{number}</span>
          </div>
        )}

        {/* Hover top tag */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-[#0A0A0A] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-white/90 px-2 py-1">N°{number}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="bg-[#E63946] text-white px-2 py-1">Reduced</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#0A0A0A]/45 mb-1">
          {category || 'Object'}
        </p>
        <h3 className="font-sans text-sm font-semibold uppercase tracking-[-0.01em] text-[#0A0A0A] leading-snug line-clamp-2 group-hover:text-[#E63946] transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 font-mono text-[12px] tracking-tight text-[#0A0A0A]/75">
          {formatPrice(product.price)}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="ml-2 line-through text-[#0A0A0A]/35">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
