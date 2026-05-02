'use client';

import Image from 'next/image';
import Link from 'next/link';
import { use, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Truck,
  Star,
} from 'lucide-react';
import { PageLoader } from '@/components/shared';
import { Container } from '@/components/layout';
import { ReviewPreview } from '@/components/product/review-preview';
import { useProduct } from '@/hooks/use-products';
import { useAuth } from '@/providers/auth-provider';
import { useCartStore } from '@/stores/cart-store';
import { EDITORIAL_FALLBACK_IMAGES, getEditorialImage } from '@/lib/editorial';
import { ROUTES } from '@/lib/constants';
import { cn, formatPrice } from '@/lib/utils';
import type { Category } from '@/types';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: product, isLoading, error } = useProduct(slug);
  const { isAuthenticated } = useAuth();
  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return <PageLoader text="Loading product..." />;
  }

  if (error || !product) {
    notFound();
  }

  const category = typeof product.category === 'object' ? (product.category as Category) : null;
  const galleryImages =
    product.images.length > 0
      ? product.images
      : [getEditorialImage(product, 0), EDITORIAL_FALLBACK_IMAGES[1], EDITORIAL_FALLBACK_IMAGES[2]];
  const currentImage = galleryImages[activeImage] ?? galleryImages[0];

  const handleAddToBag = async () => {
    if (!isAuthenticated) {
      router.push(ROUTES.login);
      return;
    }

    await addToCart(product._id, quantity);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push(ROUTES.login);
      return;
    }

    await addToCart(product._id, quantity);
    router.push(ROUTES.checkout);
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 md:px-12 bg-white">
      <Container className="max-w-[1200px] px-0 mx-auto">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href={ROUTES.products}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#71717a] transition hover:text-[#16a34a] relative z-20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to collection
          </Link>
        </div>

        <section className="relative">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            {/* Left: Images */}
            <article className="relative">
              <div className="relative">
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#f4f4f5] border border-[#e4e4e7] shadow-sm group">
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-4">
                  {galleryImages.slice(0, 3).map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={cn(
                        'relative aspect-square overflow-hidden rounded-2xl border transition-all duration-300',
                        activeImage === index
                          ? 'border-[#16a34a] ring-2 ring-[#16a34a]/20 opacity-100 shadow-md'
                          : 'border-[#e4e4e7] opacity-70 hover:opacity-100 bg-[#f4f4f5]'
                      )}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} preview ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="15vw"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </article>

            {/* Right: Details */}
            <article className="flex flex-col py-2 lg:py-8 lg:pl-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16a34a]/10 text-[10px] uppercase tracking-widest text-[#16a34a] font-bold border border-[#16a34a]/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Authentic
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#a1a1aa] font-semibold">
                  {product.stock > 0 ? 'Ready to ship' : 'Sold out'}
                </span>
              </div>

              <h1 className="mt-6 font-heading text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-[#18181B] leading-[1.1]">
                {product.name}
              </h1>

              <div className="mt-8 flex flex-wrap items-end gap-10">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#a1a1aa] font-medium mb-2">Price</p>
                  <p className="font-mono text-3xl font-semibold text-[#16a34a]">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#a1a1aa] font-medium mb-2">Reviews</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />)}
                    </div>
                    <p className="text-sm font-medium text-[#71717a]">
                      ({product.reviewCount})
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-base leading-relaxed text-[#71717a]">
                {product.shortDescription || product.description}
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Truck, label: 'Fast dispatch', value: 'Express worldwide' },
                  { icon: ShieldCheck, label: 'On-chain proof', value: 'Immutable record' },
                  { icon: Sparkles, label: 'Premium quality', value: 'Curated selection' },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-2xl bg-[#f4f4f5] border border-[#e4e4e7] transition hover:border-[#16a34a]/30">
                    <item.icon className="w-5 h-5 text-[#16a34a]" />
                    <p className="mt-3 text-[11px] uppercase tracking-widest text-[#18181B] font-bold">{item.label}</p>
                    <p className="mt-1.5 text-xs text-[#71717a]">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-4">
                <div className="flex items-center h-14 rounded-full border border-[#e4e4e7] bg-[#f4f4f5]">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="inline-flex h-full w-12 items-center justify-center text-[#71717a] transition hover:text-[#18181B]"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="inline-flex h-full min-w-14 items-center justify-center text-sm font-semibold text-[#18181B]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(product.stock || 1, value + 1))}
                    disabled={product.stock <= quantity}
                    className="inline-flex h-full w-12 items-center justify-center text-[#71717a] transition hover:text-[#18181B] disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="btn-primary h-14 px-8 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy now
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleAddToBag}
                  disabled={product.stock === 0}
                  className="btn-ghost h-14 px-8 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to bag
                </button>
              </div>

              <div className="mt-10 rounded-3xl border border-[#e4e4e7] bg-white/40 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#a1a1aa] font-semibold">Stock status</span>
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-[#18181B]">
                      <Check className="w-4 h-4 text-[#16a34a]" />
                      {product.stock} pieces available
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-red-500">Currently unavailable</span>
                  )}
                </div>

                {product.tags.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#e4e4e7] bg-white px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#71717a]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          </div>
        </section>

        <section className="mt-20 grid gap-10 lg:grid-cols-2 pt-16 border-t border-[#e4e4e7]">
          <article>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#a1a1aa] font-semibold">Description</p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-[#18181B]">
              Product notes
            </h2>
            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-[#71717a] sm:text-base">
              {product.description}
            </p>
          </article>

          <article className="rounded-3xl border border-[#e4e4e7] bg-[#f4f4f5] p-8 md:p-10">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#a1a1aa] font-semibold">Purchase flow</p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-[#18181B]">
              Transparent & Direct
            </h2>
            <div className="mt-8 space-y-4">
              {[
                'Every product is guaranteed authentic and its history is verifiable on-chain.',
                'Real reviews from verified buyers only. No manipulation possible.',
                'Secure checkout with immediate order confirmation and tracking.',
              ].map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[#e4e4e7] bg-white px-5 py-4 text-sm leading-relaxed text-[#71717a] shadow-sm flex items-start gap-4"
                >
                  <div className="mt-0.5 min-w-5 flex justify-center text-[#16a34a]">
                    <Check className="w-4 h-4" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* ─── Customer Reviews Section ─── */}
        <section className="mt-20 pt-16 border-t border-[#e4e4e7]">
          <div className="mb-10 text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#a1a1aa] font-semibold">Community</p>
            <h2 className="mt-4 font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-[#18181B]">
              Verified Reviews
            </h2>
          </div>
          <ReviewPreview
            productId={product._id}
            averageRating={product.averageRating}
            reviewCount={product.reviewCount}
          />
        </section>
      </Container>
    </div>
  );
}
