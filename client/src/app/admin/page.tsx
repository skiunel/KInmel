'use client';

import Link from 'next/link';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowUpRight,
  Clock,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useDashboardStats } from '@/hooks/use-admin';
import { formatDate, formatPrice, cn } from '@/lib/utils';

const ACCENT = '#E63946';
const INK = '#0A0A0A';

export default function AdminDashboardPage() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-[#0A0A0A]/10 animate-pulse" />
          ))}
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-[#0A0A0A]/10 min-h-[280px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { stats, trends, charts, recentOrders } = data;
  const pendingTotal = stats.pendingOrders;
  const inStock = stats.totalProducts;

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#0A0A0A]/10 border border-[#0A0A0A]/10">
        <Stat
          label="Revenue (30d)"
          value={formatPrice(stats.totalRevenue)}
          delta={trends.revenueChange}
          icon={DollarSign}
        />
        <Stat
          label="Orders"
          value={stats.totalOrders ?? recentOrders.length}
          delta={trends.ordersChange}
          icon={ShoppingBag}
        />
        <Stat
          label="Pending"
          value={pendingTotal}
          icon={Clock}
          accent
        />
        <Stat
          label="Products live"
          value={inStock}
          icon={Package}
        />
      </section>

      {/* Charts row */}
      <section className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 bg-white border border-[#0A0A0A]/10 p-6">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#0A0A0A]/45">◆ Revenue</p>
              <h2 className="font-sans text-lg font-bold tracking-[-0.02em] text-[#0A0A0A] mt-1">Last 30 days</h2>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0A0A0A]/55">
              orders + revenue
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.revenueChart} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={INK} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={INK} stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="od" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ACCENT} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={ACCENT} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,10,10,0.06)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(10,10,10,0.4)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(10,10,10,0.4)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={45} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid rgba(10,10,10,0.12)',
                    borderRadius: 0,
                    fontSize: 11,
                    color: '#0A0A0A',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                  cursor={{ stroke: ACCENT, strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="revenue" stroke={INK} strokeWidth={2} fill="url(#rv)" />
                <Area type="monotone" dataKey="orders" stroke={ACCENT} strokeWidth={2} fill="url(#od)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-[#0A0A0A]/10 p-6">
          <div className="mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#0A0A0A]/45">◆ Orders</p>
            <h2 className="font-sans text-lg font-bold tracking-[-0.02em] text-[#0A0A0A] mt-1">By status</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.ordersByStatus} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,10,10,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(10,10,10,0.4)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(10,10,10,0.4)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid rgba(10,10,10,0.12)',
                    borderRadius: 0,
                    fontSize: 11,
                    color: '#0A0A0A',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                  cursor={{ fill: 'rgba(10,10,10,0.04)' }}
                />
                <Bar dataKey="value" fill={INK} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Action items + recent orders */}
      <section className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-1 bg-white border border-[#0A0A0A]/10 p-6">
          <div className="mb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#E63946]">◆ Action</p>
            <h2 className="font-sans text-lg font-bold tracking-[-0.02em] text-[#0A0A0A] mt-1">Needs attention</h2>
          </div>
          <div className="border-t border-[#0A0A0A]/10">
            <ActionRow
              label="Pending orders"
              value={pendingTotal}
              sub="Awaiting confirmation"
              href={ROUTES.adminOrders}
              accent
            />
            <ActionRow
              label="Active products"
              value={inStock}
              sub="In catalogue"
              href={ROUTES.adminProducts}
            />
            <ActionRow
              label="Total users"
              value={stats.totalUsers}
              sub="Registered customers"
              href={ROUTES.adminUsers}
            />
            <ActionRow
              label="Signed reviews"
              value={stats.verifiedReviews}
              sub="By verified buyers"
              href={ROUTES.adminReviews}
            />
          </div>
        </div>

        <div className="xl:col-span-2 bg-white border border-[#0A0A0A]/10 p-6">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#0A0A0A]/45">◆ Activity</p>
              <h2 className="font-sans text-lg font-bold tracking-[-0.02em] text-[#0A0A0A] mt-1">Recent orders</h2>
            </div>
            <Link
              href={ROUTES.adminOrders}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0A0A0A]/55 hover:text-[#E63946] inline-flex items-center gap-1"
            >
              View all <ArrowUpRight className="size-3" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-center py-12 font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/40">
              ◆ No orders yet
            </p>
          ) : (
            <div className="border-t border-[#0A0A0A]/10">
              {recentOrders.slice(0, 6).map((o) => (
                <div key={o._id} className="flex items-center justify-between py-3 border-b border-[#0A0A0A]/10 last:border-0">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0A0A0A]/45 w-20 shrink-0">
                      {o.orderNumber.slice(-8)}
                    </span>
                    <span className="text-sm text-[#0A0A0A] truncate">
                      {typeof o.user === 'object' && o.user && 'name' in o.user ? (o.user as { name: string }).name : 'Guest'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={cn(
                      'font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-1',
                      o.status === 'pending' && 'bg-[#E63946] text-white',
                      o.status === 'delivered' && 'bg-[#0A0A0A] text-white',
                      !['pending', 'delivered'].includes(o.status) && 'bg-[#F4F4F4] text-[#0A0A0A]/65'
                    )}>
                      {o.status}
                    </span>
                    <span className="font-mono text-[12px] tabular-nums text-[#0A0A0A] w-24 text-right">
                      {formatPrice(o.totalAmount)}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0A0A0A]/40 hidden md:inline w-20 text-right">
                      {formatDate(o.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  delta,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  delta?: number;
  icon: typeof DollarSign;
  accent?: boolean;
}) {
  const isPositive = (delta ?? 0) >= 0;
  const highlight = accent && Number(value) > 0;
  return (
    <div className={cn('p-6', highlight ? 'bg-[#E63946] text-white' : 'bg-white')}>
      <div className="flex items-start justify-between mb-3">
        <p className={cn(
          'font-mono text-[10px] uppercase tracking-[0.22em]',
          highlight ? 'text-white/80' : 'text-[#0A0A0A]/45'
        )}>
          ◆ {label}
        </p>
        <Icon className={cn('size-3.5', highlight ? 'text-white/65' : 'text-[#0A0A0A]/35')} />
      </div>
      <p className={cn(
        'font-sans text-2xl md:text-3xl font-black tracking-[-0.02em]',
        highlight ? 'text-white' : 'text-[#0A0A0A]'
      )}>
        {value}
      </p>
      {delta !== undefined && (
        <p className={cn(
          'mt-2 font-mono text-[10px] inline-flex items-center gap-1 uppercase tracking-[0.16em]',
          highlight ? 'text-white/75' : isPositive ? 'text-[#0A0A0A]' : 'text-[#E63946]'
        )}>
          {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {isPositive ? '+' : ''}{delta}% vs 30d
        </p>
      )}
    </div>
  );
}

function ActionRow({
  label,
  value,
  sub,
  href,
  accent,
}: {
  label: string;
  value: number;
  sub: string;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between py-4 border-b border-[#0A0A0A]/10 last:border-0 hover:bg-[#F4F4F4] -mx-2 px-2 transition-colors group"
    >
      <div>
        <p className="text-sm font-semibold text-[#0A0A0A]">{label}</p>
        <p className="text-xs text-[#0A0A0A]/55 mt-0.5">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn(
          'font-sans text-2xl font-black tabular-nums',
          accent && value > 0 ? 'text-[#E63946]' : 'text-[#0A0A0A]'
        )}>
          {value}
        </span>
        <ArrowUpRight className="size-3.5 text-[#0A0A0A]/30 group-hover:text-[#E63946] transition-colors" />
      </div>
    </Link>
  );
}
