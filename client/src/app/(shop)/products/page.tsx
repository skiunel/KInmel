'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useDeferredValue, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lock, Search, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCategories, useProducts } from '@/hooks/use-products';
import { ROUTES } from '@/lib/constants';
import { getEditorialImage } from '@/lib/editorial';
import { cn, formatPrice } from '@/lib/utils';
import { Pagination } from '@/components/shared/pagination';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low → high' },
  { value: 'price_desc', label: 'Price: high → low' },
] as const;

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-28 px-12 text-[#a1a1aa] flex items-center justify-center">Loading collection...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const deferredSearch = useDeferredValue(search);

  const params = useMemo(() => ({
    page, limit: 16,
    search: deferredSearch || undefined,
    sort,
    category: category || undefined,
  }), [page, deferredSearch, sort, category]);

  const { data, isLoading } = useProducts(params);
  const { data: categories = [] } = useCategories();
  const products = data?.data ?? [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60 } }
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 md:px-12 bg-white">
      {/* Elegant Header */}
      <div className="relative mb-12 overflow-hidden rounded-[2rem] bg-white/40 border border-[#e4e4e7] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#16a34a]/[0.03] via-[#fafaf8] to-transparent" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#16a34a]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#a1a1aa] mb-2">Browse Collection</p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-[#18181B]">All Products</h1>
          <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <p className="text-sm text-[#71717a] max-w-sm leading-relaxed">
              Every product review is blockchain-verified. Shop our curated collection with complete confidence.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono text-[#a1a1aa] bg-white/80 backdrop-blur border border-[#e4e4e7] px-4 py-2 rounded-full shadow-sm">
                {data?.pagination.total ?? 0} items
              </span>
              <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="text-xs font-medium text-[#71717a] bg-white/80 backdrop-blur border border-[#e4e4e7] px-4 py-2 rounded-full outline-none appearance-none cursor-pointer hover:border-[rgba(22,163,74,0.3)] hover:text-[#18181B] transition-all shadow-sm">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr] gap-10">
        {/* Glassmorphic Sidebar */}
        <aside className="hidden xl:block">
          <div className="sticky top-28 space-y-8 bg-white/60 backdrop-blur-xl border border-[#e4e4e7] p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a1a1aa] mb-3">Search</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#a1a1aa]" />
                <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Find products..."
                  className="w-full bg-white/80 border border-[#e4e4e7] rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none placeholder:text-[#a1a1aa] focus:border-[rgba(22,163,74,0.4)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.08)] transition-all" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a1a1aa] mb-3">Categories</p>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => { setCategory(''); setPage(1); }}
                  className={cn("text-left text-xs py-2 px-3 rounded-xl transition-all", category === '' ? 'bg-[#16a34a]/10 text-[#16a34a] font-bold shadow-sm' : 'text-[#71717a] hover:bg-[#f4f4f5] font-medium')}>
                  All products
                </button>
                {categories.map(c => (
                  <button key={c._id} onClick={() => { setCategory(c.slug); setPage(1); }}
                    className={cn("text-left text-xs py-2 px-3 rounded-xl transition-all", category === c.slug ? 'bg-[#16a34a]/10 text-[#16a34a] font-bold shadow-sm' : 'text-[#71717a] hover:bg-[#f4f4f5] font-medium')}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Dense Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-5">
              {[...Array(8)].map((_, i) => <div key={i} className="aspect-[4/5] bg-[#f4f4f5] animate-pulse rounded-2xl" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white/40 border border-[#e4e4e7] rounded-3xl">
              <p className="text-sm text-[#a1a1aa]">No products found matching your criteria.</p>
            </div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-5"
            >
              {products.map((p, i) => (
                <motion.div key={p._id} variants={item}>
                  <Link href={ROUTES.product(p.slug)} className="group block card-hover overflow-hidden h-full flex flex-col bg-white">
                    <div className="relative aspect-[4/5] bg-[#f4f4f5]">
                      <Image src={getEditorialImage(p, i)} alt={p.name} fill loading="lazy" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
                      
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] text-[#16a34a] font-bold border border-[#e4e4e7] shadow-sm">
                        <Lock className="w-3 h-3" /> Verified
                      </div>
                      
                      {!p.stock && (
                        <div className="absolute top-2 left-2 rounded-full bg-white/90 backdrop-blur-md px-2 py-1 text-[10px] text-[#a1a1aa] font-bold border border-[#e4e4e7] shadow-sm">
                          Sold out
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h3 className="font-heading text-[13px] sm:text-sm font-bold tracking-tight group-hover:text-[#16a34a] transition-colors line-clamp-2">{p.name}</h3>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex gap-0.5">{[...Array(5)].map((_, j) => <Star key={j} className="w-2.5 h-2.5 fill-[#f59e0b] text-[#f59e0b]" />)}</div>
                        <span className="font-mono text-xs sm:text-sm font-medium text-[#16a34a]">{formatPrice(p.price)}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {data?.pagination && data.pagination.pages > 1 && (
            <div className="mt-12 border-t border-[#e4e4e7] pt-8 flex justify-center">
              <Pagination pagination={data.pagination} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
