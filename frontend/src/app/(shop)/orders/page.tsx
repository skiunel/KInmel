'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ShoppingBag, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Pagination } from '@/components/shared/pagination';
import { EmptyState } from '@/components/shared';
import { OrderCard } from '@/components/orders';
import { useOrders } from '@/hooks/use-orders';
import { useAuth } from '@/providers/auth-provider';
import { ROUTES, ORDER_STATUS_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const STATUS_FILTERS = [
  { value: '', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // All orders for badge counts (separate query, no status filter)
  const { data: allData } = useOrders({ page: 1, limit: 200, sort: 'newest' });

  const { data, isLoading } = useOrders({
    page,
    limit: 10,
    status: statusFilter || undefined,
    sort: 'newest',
  });

  const counts = (allData?.data ?? []).reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    acc[''] = (acc[''] ?? 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push(ROUTES.login);
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="size-8 animate-spin text-[#E63946]" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="My Orders"
        description="Track every order, delivery stage, and payment status."
        breadcrumbs={[
          { label: 'Home', href: ROUTES.home },
          { label: 'My Orders' },
        ]}
      />

      <section className="bg-white pb-24">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 pt-10">
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {STATUS_FILTERS.map((filter) => {
              const count = counts[filter.value] ?? 0;
              const isActive = statusFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  onClick={() => { setStatusFilter(filter.value); setPage(1); }}
                  className={cn(
                    'whitespace-nowrap inline-flex items-center gap-2 px-4 h-9 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors',
                    isActive
                      ? 'bg-[#0A0A0A] text-white'
                      : 'bg-white text-[#0A0A0A] border border-[#0A0A0A]/15 hover:bg-[#0A0A0A] hover:text-white'
                  )}
                >
                  {filter.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        'inline-flex items-center justify-center min-w-[18px] px-1 h-[18px] text-[9px] font-bold',
                        isActive ? 'bg-white text-[#0A0A0A]' : 'bg-[#0A0A0A]/10 text-[#0A0A0A]'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[120px] bg-[#F4F4F4] border border-[#0A0A0A]/10 animate-pulse" />
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="border border-[#0A0A0A]/10 bg-white p-10 text-center">
              <EmptyState
                icon={statusFilter ? Package : ShoppingBag}
                title={
                  statusFilter
                    ? `No ${ORDER_STATUS_LABELS[statusFilter]?.toLowerCase() || ''} orders`
                    : 'No orders yet'
                }
                description={
                  statusFilter
                    ? 'Try selecting a different status filter.'
                    : 'When you place an order, it will appear here.'
                }
                action={
                  statusFilter
                    ? { label: 'View all orders', onClick: () => setStatusFilter('') }
                    : { label: 'Start Shopping', href: ROUTES.products }
                }
              />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${statusFilter}-${page}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {data.data.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {data?.pagination && data.pagination.pages > 1 && (
            <div className="mt-8 pt-6 border-t border-[#0A0A0A]/10 flex justify-center">
              <Pagination pagination={data.pagination} onPageChange={setPage} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
