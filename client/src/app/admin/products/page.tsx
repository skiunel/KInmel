'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  ArrowUpDown,
  Eye,
  EyeOff,
  ImagePlus,
  Package,
  PencilLine,
  Search,
  Star,
  Upload,
} from 'lucide-react';
import { StatCard } from '@/components/admin';
import { Pagination } from '@/components/shared/pagination';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAdminProducts } from '@/hooks/use-admin';
import { FASHION_IMAGE_AI_PROMPT, getEditorialImage } from '@/lib/editorial';
import { formatPrice } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name_asc', label: 'Name: A to Z' },
] as const;

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminProducts({
    page,
    limit: 15,
    sort,
    search: search || undefined,
  });

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  const activeCount = products.filter((product) => product.isActive).length;
  const outOfStock = products.filter((product) => product.stock === 0).length;
  const averageRating =
    products.length > 0
      ? (
          products.reduce((sum, product) => sum + product.averageRating, 0) / products.length
        ).toFixed(1)
      : '—';

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <article className="border border-[#0A0A0A]/10 bg-white p-7">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#E63946] mb-1">Catalog manager</p>
          <h2 className="font-heading text-3xl font-black text-[#0A0A0A]">Add or refine</h2>
          <p className="mt-3 text-sm text-[#0A0A0A]/50 leading-relaxed">
            Create or update product listings. Changes reflect immediately on the storefront.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A]/40">Product name</label>
              <Input placeholder="Shadow Hoodie" className="mt-2 border-[#0A0A0A]/10 bg-white text-[#0A0A0A]" />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A]/40">Category</label>
              <Input placeholder="Outerwear" className="mt-2 border-[#0A0A0A]/10 bg-white text-[#0A0A0A]" />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A]/40">Price</label>
              <Input placeholder="190" className="mt-2 border-[#0A0A0A]/10 bg-white text-[#0A0A0A]" />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A]/40">Stock</label>
              <Input placeholder="48" className="mt-2 border-[#0A0A0A]/10 bg-white text-[#0A0A0A]" />
            </div>
            <div className="md:col-span-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A]/40">Description</label>
              <Textarea
                placeholder="Minimal, oversized, built for streetwear."
                className="mt-2 min-h-28 border-[#0A0A0A]/10 bg-white text-[#0A0A0A]"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn-primary !py-2.5 !px-5 !text-xs flex items-center gap-2">
              <PencilLine className="size-4" />
              Save draft
            </button>
            <button type="button" className="btn-ghost !py-2.5 !px-5 !text-xs">
              Publish piece
            </button>
          </div>
        </article>

        <article className="border border-[#0A0A0A]/10 bg-white p-7">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A]/40">Image upload</p>
          <h2 className="mt-2 font-heading text-3xl font-black text-[#0A0A0A]">Visual direction</h2>
          <div className="mt-6 overflow-hidden rounded-2xl border border-[#0A0A0A]/10 bg-white p-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#E63946]/10">
              <Image
                src="/editorial-model-b.svg"
                alt="Editorial upload placeholder"
                fill
                unoptimized
                className="object-cover opacity-60"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#0A0A0A]/10 bg-white px-4 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#0A0A0A] hover:bg-[#F4F4F4] hover:border-[#E63946]/40 transition-all"
            >
              <Upload className="size-4" />
              Upload images
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#0A0A0A]/10 bg-white px-4 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#0A0A0A] hover:bg-[#F4F4F4] hover:border-[#E63946]/40 transition-all"
            >
              <ImagePlus className="size-4" />
              Replace hero art
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-[#0A0A0A]/10 bg-white p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A]/40">AI art direction</p>
            <p className="mt-3 text-sm leading-7 text-[#0A0A0A]/60">{FASHION_IMAGE_AI_PROMPT}</p>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total products" value={pagination?.total ?? '—'} icon={Package} />
        <StatCard label="Active" value={activeCount} icon={Eye} />
        <StatCard label="Out of stock" value={outOfStock} icon={EyeOff} />
        <StatCard label="Avg rating" value={averageRating} icon={Star} />
      </section>

      <section className="border border-[#0A0A0A]/10 bg-white p-6">
        <div className="flex flex-col gap-4 border-b border-[#0A0A0A]/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A]/40">Product table</p>
            <h2 className="mt-1 font-heading text-2xl font-black text-[#0A0A0A]">Catalog inventory</h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 sm:min-w-[18rem]">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#0A0A0A]/40" />
              <Input
                placeholder="Search products"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                className="rounded-full border-[#0A0A0A]/10 bg-white pl-11 text-[#0A0A0A]"
              />
            </div>

            <label className="rounded-full border border-[#0A0A0A]/10 bg-white px-4 py-2">
              <span className="sr-only">Sort products</span>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="size-4 text-[#0A0A0A]/40" />
                <select
                  value={sort}
                  onChange={(event) => { setSort(event.target.value); setPage(1); }}
                  className="bg-transparent text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#0A0A0A] outline-none"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#FFFFFF]">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-[#0A0A0A]/10">
          <div className="hidden grid-cols-[1.2fr_0.7fr_0.6fr_0.6fr_0.6fr] gap-4 bg-white px-5 py-4 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#0A0A0A]/50 lg:grid">
            <span>Product</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Rating</span>
            <span>Status</span>
          </div>

          {isLoading ? (
            <div className="space-y-px">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse bg-[#F4F4F4]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Package className="mx-auto size-10 text-[#0A0A0A]/20" />
              <p className="mt-4 text-sm text-[#0A0A0A]/40">No products found.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {products.map((product, index) => (
                <div
                  key={product._id}
                  className="grid gap-4 px-5 py-4 lg:grid-cols-[1.2fr_0.7fr_0.6fr_0.6fr_0.6fr] lg:items-center hover:bg-[#F4F4F4] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-14 overflow-hidden rounded-xl bg-[#E63946]/10 border border-[#0A0A0A]/10">
                      <Image
                        src={getEditorialImage(product, index)}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#0A0A0A]">{product.name}</p>
                      <p className="mt-0.5 truncate text-xs text-[#0A0A0A]/40">{product.slug}</p>
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-[#E63946]">{formatPrice(product.price)}</div>
                  <div className="text-sm text-[#0A0A0A]/60">{product.stock}</div>
                  <div className="text-sm text-[#0A0A0A]/60">{product.averageRating.toFixed(1)}</div>
                  <div>
                    <span
                      className={
                        product.isActive
                          ? 'rounded-full border border-[#E63946]/30 bg-[#E63946]/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#E63946]'
                          : 'rounded-full border border-[#E63946]/30 bg-[#E63946]/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#E63946]'
                      }
                    >
                      {product.isActive ? 'Live' : 'Hidden'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {pagination && (
          <div className="mt-6">
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        )}
      </section>
    </div>
  );
}
