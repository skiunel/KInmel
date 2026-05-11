'use client';

import { Suspense, useDeferredValue, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useCategories, useProducts } from '@/hooks/use-products';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/shared/pagination';
import { ProductCard } from '@/components/product';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low → high' },
  { value: 'price_desc', label: 'Price: high → low' },
] as const;

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-28 px-12 text-white/60 flex items-center justify-center">
          Loading collection...
        </div>
      }
    >
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

  const params = useMemo(
    () => ({
      page,
      limit: 16,
      search: deferredSearch || undefined,
      sort,
      category: category || undefined,
    }),
    [page, deferredSearch, sort, category]
  );

  const { data, isLoading } = useProducts(params);
  const { data: categories = [] } = useCategories();
  const products = data?.data ?? [];

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60 } },
  };

  return (
    <div className="relative min-h-screen pt-28 pb-24 px-6 md:px-10 bg-[#0B0B0D]">
      <div className="relative max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12 border-b border-[#EDE7DA]/8 pb-10"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#FF3D00] mb-5">
            ◆ The Catalogue
          </p>
          <h1 className="font-heading text-6xl md:text-8xl font-black uppercase tracking-[-0.04em] text-[#EDE7DA] leading-[0.88]">
            Every<br />
            <span className="italic font-light">object.</span>
          </h1>
          <p className="mt-6 text-[14px] leading-relaxed text-[#EDE7DA]/55 max-w-md">
            A small, edited inventory. Reviewed by people who actually own them.
          </p>
        </motion.div>

        {/* Top bar: Search + Sort + Count */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search products..."
              className="glass-input w-full h-12 pl-11 placeholder:text-white/30"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-mono text-white/40 px-3 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl">
              {data?.pagination.total ?? 0} items
            </span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="text-xs font-medium text-white/80 bg-white/[0.04] border border-white/10 px-4 py-2 rounded-full outline-none cursor-pointer hover:border-[#6C63FF]/40 backdrop-blur-xl transition-all"
            >
              {SORT_OPTIONS.map((o) => (
                <option
                  key={o.value}
                  value={o.value}
                  className="bg-[#07070F] text-white"
                >
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pill filter buttons */}
        <div className="mb-10 flex flex-wrap gap-2">
          <FilterPill active={category === ''} onClick={() => { setCategory(''); setPage(1); }}>
            All
          </FilterPill>
          {categories.map((c) => (
            <FilterPill
              key={c._id}
              active={category === c.slug}
              onClick={() => {
                setCategory(c.slug);
                setPage(1);
              }}
            >
              {c.name}
            </FilterPill>
          ))}
        </div>

        {/* Auto-fill grid: minmax(280px, 1fr) */}
        {isLoading ? (
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card text-center py-20">
            <p className="text-sm text-white/50">No products found matching your criteria.</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {products.map((p) => (
              <motion.div key={p._id} variants={item}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {data?.pagination && data.pagination.pages > 1 && (
          <div className="mt-12 pt-8 border-t border-white/10 flex justify-center">
            <Pagination pagination={data.pagination} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all backdrop-blur-xl',
        active
          ? 'bg-gradient-to-r from-[#6C63FF] to-[#8B7FFF] text-white shadow-[0_4px_20px_rgba(108,99,255,0.4)] border border-[#6C63FF]'
          : 'bg-white/[0.04] text-white/60 border border-white/10 hover:border-[#6C63FF]/40 hover:text-white'
      )}
    >
      {children}
    </button>
  );
}
