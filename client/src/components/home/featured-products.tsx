'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
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
      .getFeatured(6)
      .then((res) => setProducts(res))
      .catch((e) => setError(e?.message || 'failed'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="relative bg-[#0B0B0D] py-24 sm:py-32 border-t border-[#EDE7DA]/8">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
        {/* Section header */}
        <div className="grid lg:grid-cols-12 gap-6 mb-16 items-end">
          <div className="lg:col-span-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#FF3D00] mb-6">
              ◆ 002 / The Catalogue
            </p>
            <h2 className="font-heading text-6xl md:text-8xl font-black uppercase tracking-[-0.04em] leading-[0.88] text-[#EDE7DA]">
              Selected
              <br />
              <span className="italic font-light">objects.</span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Link
              href={ROUTES.products}
              className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[#EDE7DA]/65 hover:text-[#FF3D00] transition-colors"
            >
              See all 2,341
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#EDE7DA]/8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#0F0F12] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="border border-[#EDE7DA]/10 p-16 text-center">
            <p className="font-mono text-xs text-[#FF3D00] uppercase tracking-widest mb-3">Connection refused</p>
            <p className="text-sm text-[#EDE7DA]/55">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="border border-[#EDE7DA]/10 p-16 text-center text-[#EDE7DA]/45 font-mono text-xs uppercase tracking-widest">
            Catalogue empty
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#EDE7DA]/8">
            {products.map((product, idx) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: idx * 0.06 }}
              >
                <EditorialCard product={product} index={idx} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EditorialCard({ product, index }: { product: Product; index: number }) {
  const img = product.images?.[0];
  const number = String(index + 1).padStart(3, '0');

  return (
    <Link
      href={`${ROUTES.products}/${product.slug}`}
      className="group relative block aspect-[3/4] overflow-hidden bg-[#0F0F12]"
    >
      {img ? (
        <Image
          src={img}
          alt={product.name}
          fill
          unoptimized
          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[900ms] group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-heading text-[14rem] font-black text-[#EDE7DA]/5">{number}</span>
        </div>
      )}

      {/* Darken */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/30 to-transparent opacity-90 group-hover:opacity-70 transition-opacity" />

      {/* Top meta */}
      <div className="absolute top-5 left-5 right-5 flex items-start justify-between text-[10px] font-mono uppercase tracking-[0.24em] text-[#EDE7DA]/85">
        <span>N°{number}</span>
        {product.compareAtPrice && product.compareAtPrice > product.price ? (
          <span className="text-[#FF3D00]">◆ Reduced</span>
        ) : (
          <span>◆ In stock</span>
        )}
      </div>

      {/* Bottom info */}
      <div className="absolute inset-x-0 bottom-0 p-6">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#EDE7DA]/55 mb-2">
              {typeof product.category === 'object' ? product.category?.name : 'Object'}
            </p>
            <h3 className="font-heading text-xl md:text-2xl font-black uppercase tracking-tight text-[#EDE7DA] leading-[1.05] line-clamp-2">
              {product.name}
            </h3>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#EDE7DA]/65">
              {formatPrice(product.price)}
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="ml-2 line-through text-[#EDE7DA]/30">{formatPrice(product.compareAtPrice)}</span>
              )}
            </p>
          </div>
          <div className="size-10 inline-flex items-center justify-center border border-[#EDE7DA]/30 text-[#EDE7DA] opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:bg-[#FF3D00] group-hover:border-[#FF3D00] group-hover:text-[#0B0B0D] transition-all duration-500">
            <ArrowUpRight className="size-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
