'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Clock,
  Package,
  Truck,
  CircleCheck,
  XCircle,
  ArrowUpDown,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatCard } from '@/components/admin';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders';
import { Pagination } from '@/components/shared/pagination';
import { formatPrice, formatDate } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useAdminOrders } from '@/hooks/use-admin-orders';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';

const STATUS_TABS = [
  { value: '', label: 'All', icon: ClipboardList },
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'confirmed', label: 'Confirmed', icon: Package },
  { value: 'processing', label: 'Processing', icon: Package },
  { value: 'shipped', label: 'Shipped', icon: Truck },
  { value: 'delivered', label: 'Delivered', icon: CircleCheck },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'total_desc', label: 'Amount: High → Low' },
  { value: 'total_asc', label: 'Amount: Low → High' },
];

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminOrders({
    page,
    limit: 15,
    status: statusFilter || undefined,
    sort,
  });

  const orders = data?.data || [];
  const pagination = data?.pagination;

  // Quick stats from current results
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-heading">
            Order Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track, update, and manage customer orders
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={pagination?.total ?? '—'}
          icon={ClipboardList}
        />
        <StatCard
          label="Pending"
          value={pendingCount}
          icon={Clock}
          variant="verified"
        />
        <StatCard
          label="In Transit"
          value={shippedCount}
          icon={Truck}
          variant="chain"
        />
        <StatCard
          label="This Page Revenue"
          value={formatPrice(
            orders.reduce((sum, o) => sum + o.totalAmount, 0)
          )}
          icon={CircleCheck}
          variant="success"
        />
      </div>

      {/* Filters bar */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {STATUS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setPage(1);
                  }}
                  className={cn(
                    'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="size-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Select
              value={sort}
              onValueChange={(v) => v && setSort(v)}
            >
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <ArrowUpDown className="size-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Table header */}
        <div className="hidden lg:grid grid-cols-[1fr_140px_120px_100px_110px_80px] gap-4 border-b bg-muted/50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Order</span>
          <span>Date</span>
          <span>Total</span>
          <span>Payment</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              No orders found
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${statusFilter}-${sort}-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="divide-y"
            >
              {orders.map((order) => (
                <OrderRow key={order._id} order={order} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Pagination
          pagination={pagination}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

// ─── Order Row ───

function OrderRow({ order }: { order: Order }) {
  const userName =
    typeof order.user === 'object' ? order.user.name : 'Customer';
  const userEmail =
    typeof order.user === 'object' ? order.user.email : '';
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Link
      href={ROUTES.adminOrder(order._id)}
      className="grid grid-cols-1 gap-2 px-5 py-4 transition-colors hover:bg-muted/30 lg:grid-cols-[1fr_140px_120px_100px_110px_80px] lg:gap-4 lg:items-center"
    >
      {/* Order info */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold font-mono text-foreground">
            {order.orderNumber}
          </span>
          <span className="lg:hidden">
            <OrderStatusBadge status={order.status} />
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {userName}
          {userEmail && (
            <span className="text-muted-foreground/60"> · {userEmail}</span>
          )}
          {' · '}
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Date */}
      <div className="text-sm text-muted-foreground hidden lg:block">
        {formatDate(order.createdAt)}
      </div>

      {/* Total */}
      <div className="text-sm font-semibold text-foreground hidden lg:block">
        {formatPrice(order.totalAmount)}
      </div>

      {/* Payment */}
      <div className="hidden lg:block">
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>

      {/* Status */}
      <div className="hidden lg:block">
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Action */}
      <div className="hidden lg:flex lg:justify-end">
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
          <Eye className="size-4" />
        </Button>
      </div>

      {/* Mobile meta */}
      <div className="flex items-center justify-between lg:hidden text-xs text-muted-foreground">
        <span>{formatDate(order.createdAt)}</span>
        <span className="font-semibold text-foreground">
          {formatPrice(order.totalAmount)}
        </span>
      </div>
    </Link>
  );
}
