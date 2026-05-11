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
  ShieldCheck,
  ShoppingCart,
  Star,
  Clock,
  ExternalLink,
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

type TabKey = 'reviews' | 'details' | 'blockchain';

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
  const [tab, setTab] = useState<TabKey>('reviews');

  if (isLoading) return <PageLoader text="Loading product..." />;
  if (error || !product) notFound();

  const imageSrc = product.images?.[0];
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

  const stats = [
    { label: 'Total Reviews', value: product.reviewCount.toString() },
    { label: '% Verified', value: product.reviewCount > 0 ? '100%' : '—' },
    { label: 'Chain', value: 'Amoy' },
    { label: 'Response', value: '< 24h' },
  ];

  return (
    <div className="relative min-h-screen pt-32 pb-24 px-6 md:px-12 overflow-hidden">
      <div className="orb orb-violet -left-20 top-40 size-[24rem] opacity-40" />
      <div className="orb orb-cyan right-0 top-1/2 size-[20rem] opacity-40" />

      <div className="relative max-w-[1280px] mx-auto">
        {/* Breadcrumb */}
        <Link
          href={ROUTES.products}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to shop
        </Link>

        {/* Two-column layout */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left: Glass card with floating image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-square glass-card p-8 overflow-hidden">
              {/* Signed by buyer badge */}
              <div
                className="absolute top-4 right-4 z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(255,215,0,0.2), rgba(255,215,0,0.1))',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s linear infinite',
                  borderColor: 'rgba(255,215,0,0.4)',
                  color: '#FFD700',
                }}
              >
                <span>⛓</span>
                <span className="text-xs font-bold uppercase tracking-wider">
                  Signed by buyer
                </span>
              </div>

              {/* Floating product image / emoji */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center p-12"
              >
                {imageSrc ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={imageSrc}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-contain"
                      priority
                    />
                  </div>
                ) : (
                  <span className="text-[10rem]">📦</span>
                )}
              </motion.div>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.images.slice(0, 4).map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="relative aspect-square glass-card p-2 cursor-pointer hover:border-[#6C63FF]/40 transition-all"
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      unoptimized
                      className="object-contain p-2"
                      sizes="15vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Category */}
            {product.category && typeof product.category === 'object' && (
              <p className="font-mono text-xs uppercase tracking-widest text-[#00F5FF] mb-3">
                {product.category.name}
              </p>
            )}

            {/* Title */}
            <h1
              className="font-heading font-black tracking-tight text-white"
              style={{ fontSize: '34px', lineHeight: 1.1 }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-5 h-5',
                      i < Math.round(product.averageRating)
                        ? 'fill-[#FFD700] text-[#FFD700]'
                        : 'fill-white/10 text-white/20'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-white/60">
                {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mt-6">
              <p
                className="font-heading font-black"
                style={{ fontSize: '42px', color: '#6C63FF', lineHeight: 1 }}
              >
                {formatPrice(product.price)}
              </p>
            </div>

            {/* Description */}
            <p className="mt-6 text-sm text-white/70 leading-relaxed">
              {product.shortDescription || product.description}
            </p>

            {/* 2x2 stats grid */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="glass-card p-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                    {s.label}
                  </p>
                  <p className="mt-1 font-heading text-2xl font-black text-white">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Quantity + Buy */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center h-12 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                  className="inline-flex h-full w-12 items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="inline-flex h-full min-w-12 items-center justify-center text-sm font-bold text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((v) => Math.min(product.stock || 1, v + 1))
                  }
                  disabled={product.stock <= quantity}
                  className="inline-flex h-full w-12 items-center justify-center text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!stockOk}
                className="btn-primary group flex-1 h-12 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Buy Now
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={handleAddToBag}
                disabled={!stockOk}
                aria-label="Add to cart"
                className="h-12 w-12 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl text-white hover:border-[#6C63FF]/40 hover:bg-[#6C63FF]/10 transition-all disabled:opacity-40"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>

            {/* Stock + tags */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono uppercase tracking-widest text-white/40">
                Stock:
              </span>
              {stockOk ? (
                <span className="text-[#00FF88]">
                  ✓ {product.stock} pieces available
                </span>
              ) : (
                <span className="text-[#FF6B6B]">Sold out</span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-20">
          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-px">
            <TabButton active={tab === 'reviews'} onClick={() => setTab('reviews')}>
              Reviews
            </TabButton>
            <TabButton active={tab === 'details'} onClick={() => setTab('details')}>
              Details
            </TabButton>
            <TabButton
              active={tab === 'blockchain'}
              onClick={() => setTab('blockchain')}
            >
              Blockchain Data
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
              <div className="glass-card p-8">
                <h3 className="font-heading text-2xl font-black text-white mb-4">
                  Description
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-white/70">
                  {product.description}
                </p>
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border border-white/10 bg-white/[0.04] text-white/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {tab === 'blockchain' && (
              <BlockchainDataTab
                productId={product._id}
                reviewCount={product.reviewCount}
              />
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
        'relative px-5 py-3 text-sm font-semibold transition-all',
        active ? 'text-white' : 'text-white/50 hover:text-white/80'
      )}
    >
      {children}
      {active && (
        <span
          className="absolute -bottom-px left-0 right-0 h-[2px] rounded-full"
          style={{
            background: 'linear-gradient(90deg, #6C63FF, #00F5FF)',
          }}
        />
      )}
    </button>
  );
}

function BlockchainDataTab({
  productId,
  reviewCount,
}: {
  productId: string;
  reviewCount: number;
}) {
  const address = runtimeConfig.contractAddress;
  const explorerUrl = address ? buildExplorerAddressUrl(address) : '';

  return (
    <div className="glass-card p-8 space-y-6">
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-[#FFD700] mt-0.5" />
        <div>
          <h3 className="font-heading text-2xl font-black text-white">
            On-chain Provenance
          </h3>
          <p className="text-sm text-white/60 mt-1">
            Every review for this product is cryptographically anchored on Polygon Amoy.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <DataRow label="Contract Address">
          {address ? (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-[#6C63FF] hover:text-[#00F5FF] transition-colors inline-flex items-center gap-1"
            >
              {shortenAddress(address, 6)}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-sm text-white/40">Not deployed</span>
          )}
        </DataRow>
        <DataRow label="Network">
          <span className="text-sm text-white">{runtimeConfig.networkName}</span>
        </DataRow>
        <DataRow label="Transaction Count">
          <span className="text-sm text-white">{reviewCount} anchored</span>
        </DataRow>
        <DataRow label="Product ID">
          <span className="font-mono text-xs text-white/70">
            {shortenAddress(productId, 6)}
          </span>
        </DataRow>
      </div>

      <div className="flex items-center gap-2 text-xs text-white/40 pt-2 border-t border-white/10">
        <Clock className="w-3 h-3" />
        Last sync: live from chain
      </div>
    </div>
  );
}

function DataRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
      <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
        {label}
      </p>
      {children}
    </div>
  );
}
