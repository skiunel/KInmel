'use client';

import Link from 'next/link';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  ArrowUpRight, Clock, DollarSign, MessageSquare,
  Package, Shield, ShoppingCart, Users,
} from 'lucide-react';
import { DashboardCard, StatCard } from '@/components/admin';
import { ROUTES } from '@/lib/constants';
import { useDashboardStats } from '@/hooks/use-admin';
import { formatDate, formatPrice } from '@/lib/utils';

const purple = '#16a34a';
const amber = '#f59e0b';

export default function AdminDashboardPage() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-2">
          {[1, 2].map(i => <div key={i} className="rounded-xl bg-white border border-[#e4e4e7] min-h-[280px] animate-pulse" />)}
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-white border border-[#e4e4e7]" />)}
        </div>
      </div>
    );
  }

  const { stats, trends, charts, recentOrders } = data;

  return (
    <div className="space-y-5">
      {/* Top section */}
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="card-glow p-6">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-[#16a34a]" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a1a1aa]">Overview</p>
          </div>
          <h2 className="font-heading text-2xl font-extrabold tracking-tight">Store performance</h2>
          <p className="mt-2 text-sm text-[#71717a]">Real-time metrics across revenue, orders, and blockchain-verified reviews.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              { label: 'Revenue', val: `${trends.revenueChange >= 0 ? '+' : ''}${trends.revenueChange}%`, sub: 'vs last 30 days' },
              { label: 'Orders', val: `${trends.ordersChange >= 0 ? '+' : ''}${trends.ordersChange}%`, sub: 'order movement' },
              { label: 'Growth', val: `${trends.usersChange >= 0 ? '+' : ''}${trends.usersChange}%`, sub: 'new customers' },
            ].map(m => (
              <div key={m.label} className="rounded-xl border border-[#e4e4e7] bg-[#FAFAF8] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a1a1aa]">{m.label}</p>
                <p className="mt-1 text-xl font-bold tracking-tight text-[#18181B]">{m.val}</p>
                <p className="text-[11px] text-[#a1a1aa]">{m.sub}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="card p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a1a1aa] mb-1">Action needed</p>
          <h2 className="font-heading text-xl font-extrabold tracking-tight mb-5">Priority items</h2>
          <div className="space-y-2.5">
            {[
              { label: 'Pending orders', val: stats.pendingOrders, sub: 'Need confirmation', href: ROUTES.adminOrders, icon: Clock },
              { label: 'Active products', val: stats.totalProducts, sub: 'In catalog', href: ROUTES.adminProducts, icon: Package },
              { label: 'Review queue', val: charts.blockchainStats.pending + charts.blockchainStats.failed, sub: 'Pending verification', href: ROUTES.adminReviews, icon: MessageSquare },
            ].map(item => (
              <Link key={item.label} href={item.href}
                className="flex items-center justify-between rounded-xl border border-[#e4e4e7] bg-[#FAFAF8] px-4 py-3.5 transition-all hover:border-[rgba(22,163,74,0.25)] hover:bg-[rgba(22,163,74,0.02)] group">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#16a34a]/8 p-2 text-[#16a34a] group-hover:bg-[#16a34a]/12 transition-colors">
                    <item.icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#18181B]">{item.label}</p>
                    <p className="text-xs text-[#a1a1aa]">{item.sub}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-[#18181B]">{item.val}</span>
                  <ArrowUpRight className="size-4 text-[#a1a1aa] group-hover:text-[#16a34a] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </article>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total revenue" value={formatPrice(stats.totalRevenue)} change={{ value: trends.revenueChange, label: 'vs 30d' }} icon={DollarSign} />
        <StatCard label="Total orders" value={stats.totalOrders} change={{ value: trends.ordersChange, label: 'vs 30d' }} icon={ShoppingCart} />
        <StatCard label="Customers" value={stats.totalUsers} change={{ value: trends.usersChange, label: 'vs 30d' }} icon={Users} variant="chain" />
        <StatCard label="Verified reviews" value={stats.verifiedReviews} icon={Shield} variant="verified" />
      </section>

      {/* Charts */}
      <section className="grid gap-5 xl:grid-cols-2">
        <DashboardCard title="Revenue & orders">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.revenueChart}>
                <defs>
                  <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={purple} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={purple} stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="od" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={amber} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={amber} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="date" stroke="#a1a1aa" tick={{ fontSize: 11 }} />
                <YAxis stroke="#a1a1aa" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e4e4e7', borderRadius: 10, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
                <Area type="monotone" dataKey="revenue" stroke={purple} strokeWidth={2} fill="url(#rv)" />
                <Area type="monotone" dataKey="orders" stroke={amber} strokeWidth={1.5} fill="url(#od)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        <DashboardCard title="Orders by status">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.ordersByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="name" stroke="#a1a1aa" tick={{ fontSize: 11 }} />
                <YAxis stroke="#a1a1aa" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e4e4e7', borderRadius: 10, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={purple} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </section>

      {/* Recent orders */}
      <DashboardCard title="Recent orders">
        <div className="space-y-2">
          {recentOrders.map(order => (
            <Link key={order._id} href={ROUTES.adminOrder(order._id)}
              className="grid gap-3 rounded-lg border border-[#e4e4e7] bg-[#FAFAF8] px-4 py-3 transition-all hover:border-[rgba(22,163,74,0.2)] hover:bg-white md:grid-cols-[1fr_auto_auto_auto] items-center">
              <div>
                <p className="text-sm font-medium text-[#18181B]">{order.orderNumber}</p>
                <p className="text-xs text-[#a1a1aa]">{formatDate(order.createdAt)}</p>
              </div>
              <span className="text-sm font-medium text-[#16a34a]">{formatPrice(order.totalAmount)}</span>
              <span className="text-xs text-[#71717a] capitalize">{order.paymentStatus}</span>
              <span className="rounded-full bg-[#16a34a]/8 px-3 py-1 text-[10px] font-medium text-[#16a34a] capitalize">
                {order.status.replace(/_/g, ' ')}
              </span>
            </Link>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
