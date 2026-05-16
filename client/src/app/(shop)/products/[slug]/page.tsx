'use client';

import Image from 'next/image';
import Link from 'next/link';
import { use, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { PageLoader } from '@/components/shared';
import { ReviewPreview } from '@/components/product/review-preview';
import { useProduct } from '@/hooks/use-products';
import { useAuth } from '@/providers/auth-provider';
import { useCartStore } from '@/stores/cart-store';
import { ROUTES } from '@/lib/constants';
import { cn, formatPrice } from '@/lib/utils';
import {
  buildExplorerAddressUrl,
  runtimeConfig,
  shortenAddress,
} from '@/lib/runtime-config';

type TabKey = 'reviews' | 'details' | 'ledger';

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
  const [tab, setTab] = useState<TabKey>('reviews');

  if (isLoading) return <PageLoader text="Loading…" />;
  if (error || !product) notFound();

  const images = product.images?.length ? product.images : [];
  const imageSrc = images[activeImage] ?? images[0];
  const stockOk = product.stock > 0;

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

  const categoryName =
    product.category && typeof product.category === 'object'
      ? product.category.name
      : null;

  return (
    <div className="min-h-screen bg-white pt-24 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <Link
          href={ROUTES.products}
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/55 hover:text-[#E63946] mb-8 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to catalogue
        </Link>

        <div className="grid gap-10 lg:gap-16 lg:grid-cols-2">
          {/* Left: images */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-square bg-[#F4F4F4] overflow-hidden">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-sans font-black text-8xl text-[#0A0A0A]/10">◆</span>
                </div>
              )}
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
                <span className="bg-white/90 px-2 py-1 text-[#0A0A0A]">
                  ◆ {product.reviewCount} signed
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="bg-[#E63946] text-white px-2 py-1">
                    Reduced
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {images.slice(0, 5).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      'relative aspect-square bg-[#F4F4F4] border overflow-hidden transition-colors',
                      activeImage === index
                        ? 'border-[#0A0A0A]'
                        : 'border-transparent hover:border-[#0A0A0A]/30'
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: details */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col"
          >
            {categoryName && (
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#E63946] mb-3">
                ◆ {categoryName}
              </p>
            )}

            <h1 className="font-sans font-black uppercase tracking-[-0.03em] text-[#0A0A0A] leading-[1] text-[clamp(2rem,4vw,3rem)]">
              {product.name}
            </h1>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < Math.round(product.averageRating)
                        ? 'fill-[#0A0A0A] text-[#0A0A0A]'
                        : 'fill-transparent text-[#0A0A0A]/20'
                    )}
                  />
                ))}
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0A0A0A]/60">
                {product.averageRating.toFixed(1)} · {product.reviewCount} signed
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-3 border-y border-[#0A0A0A]/10 py-5">
              <p className="font-sans text-3xl md:text-4xl font-black tracking-[-0.02em] text-[#0A0A0A]">
                {formatPrice(product.price)}
              </p>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <p className="font-mono text-sm text-[#0A0A0A]/40 line-through">
                  {formatPrice(product.compareAtPrice)}
                </p>
              )}
            </div>

            <p className="mt-5 text-[14px] leading-[1.6] text-[#0A0A0A]/70">
              {product.shortDescription || product.description}
            </p>

            {/* Quantity + Buy */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <div className="flex items-center h-12 border border-[#0A0A0A]/15 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                  className="inline-flex h-full w-11 items-center justify-center text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors"
                  aria-label="Decrease"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="inline-flex h-full min-w-12 items-center justify-center font-mono text-sm font-bold text-[#0A0A0A] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((v) => Math.min(product.stock || 1, v + 1))}
                  disabled={product.stock <= quantity}
                  className="inline-flex h-full w-11 items-center justify-center text-[#0A0A0A]/60 hover:text-[#0A0A0A] disabled:opacity-30 transition-colors"
                  aria-label="Increase"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!stockOk}
                className="group flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 h-12 bg-[#0A0A0A] text-white font-mono text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-[#E63946] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Buy now
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={handleAddToBag}
                disabled={!stockOk}
                aria-label="Add to bag"
                className="h-12 w-12 inline-flex items-center justify-center border border-[#0A0A0A]/15 bg-white text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-colors disabled:opacity-40"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>

            {/* Stock */}
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em]">
              {stockOk ? (
                <span className="text-[#0A0A0A]/65">
                  ◆ {product.stock} in stock · ships in 2–3 days
                </span>
              ) : (
                <span className="text-[#E63946]">◆ Sold out</span>
              )}
            </p>

            {/* SKU / tags */}
            {(product.sku || (product.tags && product.tags.length > 0)) && (
              <div className="mt-6 pt-5 border-t border-[#0A0A0A]/10 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#0A0A0A]/55">
                {product.sku && <span>SKU · {product.sku}</span>}
                {product.tags && product.tags.length > 0 && (
                  <span>Tags · {product.tags.join(', ')}</span>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-20 border-t border-[#0A0A0A]/10">
          <div className="flex flex-wrap gap-0 border-b border-[#0A0A0A]/10">
            <TabButton active={tab === 'reviews'} onClick={() => setTab('reviews')}>
              Reviews
            </TabButton>
            <TabButton active={tab === 'details'} onClick={() => setTab('details')}>
              Details
            </TabButton>
            <TabButton active={tab === 'ledger'} onClick={() => setTab('ledger')}>
              On-chain
            </TabButton>
          </div>

          <div className="mt-8">
            {tab === 'reviews' && (
              <ReviewPreview
                productId={product._id}
                averageRating={product.averageRating}
                reviewCount={product.reviewCount}
              />
            )}
            {tab === 'details' && (
              <div className="max-w-3xl">
                <p className="whitespace-pre-line text-[14px] leading-[1.65] text-[#0A0A0A]/75">
                  {product.description}
                </p>
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] border border-[#0A0A0A]/15 bg-white text-[#0A0A0A]/65"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {tab === 'ledger' && (
              <LedgerTab productId={product._id} reviewCount={product.reviewCount} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative px-5 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors -mb-px border-b-2',
        active
          ? 'text-[#0A0A0A] border-[#0A0A0A]'
          : 'text-[#0A0A0A]/50 hover:text-[#0A0A0A] border-transparent'
      )}
    >
      {children}
    </button>
  );
}

function LedgerTab({ productId, reviewCount }: { productId: string; reviewCount: number }) {
  const address = runtimeConfig.contractAddress;
  const explorerUrl = address ? buildExplorerAddressUrl(address) : '';

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#E63946] mb-3">◆ Provenance</p>
        <h3 className="font-sans text-2xl font-black uppercase tracking-[-0.02em] text-[#0A0A0A]">
          On-chain record.
        </h3>
        <p className="mt-2 text-sm text-[#0A0A0A]/55 max-w-md">
          Every review for this product is anchored on Polygon Amoy. Verifiable by anyone.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 border-t border-l border-[#0A0A0A]/10">
        <DataRow label="Contract">
          {address ? (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-[#E63946] hover:text-[#0A0A0A] inline-flex items-center gap-1.5"
            >
              {shortenAddress(address, 6)}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="font-mono text-sm text-[#0A0A0A]/40">Not deployed</span>
          )}
        </DataRow>
        <DataRow label="Network">
          <span className="font-mono text-sm text-[#0A0A0A]">{runtimeConfig.networkName}</span>
        </DataRow>
        <DataRow label="Anchored">
          <span className="font-mono text-sm text-[#0A0A0A]">{reviewCount} reviews</span>
        </DataRow>
        <DataRow label="Product ID">
          <span className="font-mono text-xs text-[#0A0A0A]/70">
            {shortenAddress(productId, 6)}
          </span>
        </DataRow>
      </div>

      <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/40">
        <Clock className="w-3 h-3" /> Live from chain
      </div>
    </div>
  );
}

function DataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 p-5 border-r border-b border-[#0A0A0A]/10">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/45">
        {label}
      </p>
      {children}
    </div>
  );
}
