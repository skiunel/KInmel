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
    <div className="relative min-h-screen pt-24 pb-24 px-6 md:px-10 bg-white">
      <div className="relative max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12 border-b border-[#0A0A0A]/10 pb-10"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#E63946] mb-4">
            ◆ Catalogue
          </p>
          <h1 className="font-sans font-black uppercase tracking-[-0.04em] text-[#0A0A0A] leading-[0.9] text-[clamp(3rem,9vw,7rem)]">
            Every object.
          </h1>
          <p className="mt-6 text-[14px] leading-relaxed text-[#0A0A0A]/60 max-w-md">
            Small, edited inventory. Reviewed by people who actually own them.
          </p>
        </motion.div>

        <div className="mb-8 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#0A0A0A]/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search…"
              className="w-full h-11 pl-10 border border-[#0A0A0A]/15 bg-white text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/35 outline-none focus:border-[#0A0A0A]"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0A0A0A]/55">
              {data?.pagination.total ?? 0} items
            </span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#0A0A0A] bg-white border border-[#0A0A0A]/15 px-3 h-11 outline-none cursor-pointer hover:border-[#0A0A0A] transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-white text-[#0A0A0A]">
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

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#F4F4F4] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="border border-[#0A0A0A]/10 text-center py-20">
            <p className="font-mono text-xs uppercase tracking-widest text-[#0A0A0A]/55">No products found.</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {products.map((p) => (
              <motion.div key={p._id} variants={item}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {data?.pagination && data.pagination.pages > 1 && (
          <div className="mt-12 pt-6 border-t border-[#0A0A0A]/10 flex justify-center">
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
        'px-4 h-9 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors',
        active
          ? 'bg-[#0A0A0A] text-white'
          : 'bg-white text-[#0A0A0A] border border-[#0A0A0A]/15 hover:bg-[#0A0A0A] hover:text-white'
      )}
    >
      {children}
    </button>
  );
}
