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
        <article className="editorial-panel-dark">
          <p className="editorial-kicker text-white/42">Catalog manager</p>
          <p className="editorial-script mt-5 text-4xl">Product editor</p>
          <h2 className="mt-2 text-5xl font-black uppercase tracking-[-0.07em] text-white">
            Add or refine
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/64">
            Dark framing for the editor, lighter list surfaces for the data, and strong
            typography so the admin side still feels like part of the brand world.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div>
              <label className="editorial-kicker text-white/36">Product name</label>
              <Input
                placeholder="Shadow Hoodie"
                className="mt-3 rounded-[1rem] border-white/12 bg-white/[0.04] text-white shadow-none"
              />
            </div>
            <div>
              <label className="editorial-kicker text-white/36">Category</label>
              <Input
                placeholder="Outerwear"
                className="mt-3 rounded-[1rem] border-white/12 bg-white/[0.04] text-white shadow-none"
              />
            </div>
            <div>
              <label className="editorial-kicker text-white/36">Price</label>
              <Input
                placeholder="190"
                className="mt-3 rounded-[1rem] border-white/12 bg-white/[0.04] text-white shadow-none"
              />
            </div>
            <div>
              <label className="editorial-kicker text-white/36">Stock</label>
              <Input
                placeholder="48"
                className="mt-3 rounded-[1rem] border-white/12 bg-white/[0.04] text-white shadow-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="editorial-kicker text-white/36">Description</label>
              <Textarea
                placeholder="Minimal, oversized, and built for an editorial streetwear presentation."
                className="mt-3 min-h-28 rounded-[1.3rem] border-white/12 bg-white/[0.04] px-4 py-4 text-white shadow-none"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-black transition hover:bg-white/90"
            >
              <PencilLine className="size-4" />
              Save draft
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-white/8"
            >
              Publish piece
            </button>
          </div>
        </article>

        <article className="editorial-panel-light">
          <p className="editorial-kicker text-black/42">Image upload</p>
          <h2 className="mt-2 text-4xl font-black uppercase tracking-[-0.06em] text-black">
            Visual direction
          </h2>
          <div className="mt-6 overflow-hidden rounded-[1.7rem] border border-black/10 bg-white p-4 shadow-[0_18px_48px_rgba(0,0,0,0.1)]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.35rem] bg-[#f1ece4]">
              <Image
                src="/editorial-model-b.svg"
                alt="Editorial upload placeholder"
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-[1.25rem] border border-black/10 bg-white px-4 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
            >
              <Upload className="size-4" />
              Upload images
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-[1.25rem] border border-black/10 bg-white px-4 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
            >
              <ImagePlus className="size-4" />
              Replace hero art
            </button>
          </div>

          <div className="mt-6 rounded-[1.35rem] border border-black/10 bg-white p-4 shadow-[0_12px_28px_rgba(0,0,0,0.08)]">
            <p className="editorial-kicker text-black/42">AI art direction</p>
            <p className="mt-3 text-sm leading-7 text-black/68">{FASHION_IMAGE_AI_PROMPT}</p>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total products" value={pagination?.total ?? '—'} icon={Package} />
        <StatCard label="Active" value={activeCount} icon={Eye} />
        <StatCard label="Out of stock" value={outOfStock} icon={EyeOff} />
        <StatCard label="Avg rating" value={averageRating} icon={Star} />
      </section>

      <section className="editorial-card-light">
        <div className="flex flex-col gap-4 border-b border-black/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="editorial-kicker text-black/42">Product table</p>
            <h2 className="mt-2 text-4xl font-black uppercase tracking-[-0.06em] text-black">
              Catalog inventory
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 sm:min-w-[18rem]">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-black/36" />
              <Input
                placeholder="Search products"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="rounded-full border-black/10 bg-white pl-11 text-black shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
              />
            </div>

            <label className="rounded-full border border-black/10 bg-white px-4 py-2 shadow-[0_12px_28px_rgba(0,0,0,0.08)]">
              <span className="sr-only">Sort products</span>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="size-4 text-black/42" />
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-black outline-none"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-black/10">
          <div className="hidden grid-cols-[1.2fr_0.7fr_0.6fr_0.6fr_0.6fr] gap-4 bg-black px-5 py-4 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/72 lg:grid">
            <span>Product</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Rating</span>
            <span>Status</span>
          </div>

          {isLoading ? (
            <div className="space-y-px bg-black/8">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse bg-white" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white px-6 py-16 text-center">
              <Package className="mx-auto size-10 text-black/24" />
              <p className="mt-4 text-sm text-black/58">No products found.</p>
            </div>
          ) : (
            <div className="divide-y divide-black/8 bg-white">
              {products.map((product, index) => (
                <div
                  key={product._id}
                  className="grid gap-4 px-5 py-4 lg:grid-cols-[1.2fr_0.7fr_0.6fr_0.6fr_0.6fr] lg:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-16 overflow-hidden rounded-[1rem] bg-[#f1ece4]">
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
                      <p className="truncate text-lg font-black uppercase tracking-[-0.04em] text-black">
                        {product.name}
                      </p>
                      <p className="mt-1 truncate text-sm text-black/54">{product.slug}</p>
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-black">{formatPrice(product.price)}</div>
                  <div className="text-sm text-black/64">{product.stock}</div>
                  <div className="text-sm text-black/64">{product.averageRating.toFixed(1)}</div>
                  <div>
                    <span
                      className={
                        product.isActive
                          ? 'rounded-full border border-black/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-black/58'
                          : 'rounded-full border border-[#c92222]/18 bg-[#c92222]/8 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#c92222]'
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

        {pagination ? (
          <div className="mt-6">
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        ) : null}
      </section>
    </div>
  );
}
