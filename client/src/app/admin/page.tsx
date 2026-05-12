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
  MessageSquare,
  Package,
  Shield,
  Users,
} from 'lucide-react';
import { DashboardCard, StatCard } from '@/components/admin';
import { ROUTES } from '@/lib/constants';
import { useDashboardStats } from '@/hooks/use-admin';
import { formatDate, formatPrice } from '@/lib/utils';

const VIOLET = '#E63946';
const CYAN = '#E63946';
const GOLD = '#FFD700';

export default function AdminDashboardPage() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card min-h-[280px] animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 glass-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { stats, trends, charts, recentOrders } = data;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          change={{ value: trends.revenueChange, label: 'vs 30d' }}
          icon={DollarSign}
        />
        <StatCard
          label="Active Users"
          value={stats.totalUsers}
          change={{ value: trends.usersChange, label: 'vs 30d' }}
          icon={Users}
          variant="chain"
        />
        <StatCard
          label="On-Chain Reviews"
          value={stats.verifiedReviews}
          icon={Shield}
          variant="verified"
        />
        <StatCard
          label="Pending Reviews"
          value={charts.blockchainStats.pending + charts.blockchainStats.failed}
          icon={MessageSquare}
          variant="success"
        />
      </section>

      {/* Charts */}
      <section className="grid gap-5 xl:grid-cols-2">
        <DashboardCard title="Revenue & Orders (30 days)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.revenueChart}>
                <defs>
                  <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CYAN} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={CYAN} stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="od" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={VIOLET} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={VIOLET} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(7, 7, 15, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    fontSize: 12,
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={CYAN}
                  strokeWidth={2}
                  fill="url(#rv)"
                  style={{ filter: `drop-shadow(0 0 8px ${CYAN})` }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke={VIOLET}
                  strokeWidth={2}
                  fill="url(#od)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        <DashboardCard title="Orders by Status">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.ordersByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(7, 7, 15, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    fontSize: 12,
                    color: '#fff',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={VIOLET} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </section>

      {/* Priority panel */}
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#E63946] mb-2">
            Overview
          </p>
          <h2 className="font-heading text-2xl font-black text-white mb-4">
            Store Performance
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                label: 'Revenue',
                val: `${trends.revenueChange >= 0 ? '+' : ''}${trends.revenueChange}%`,
                sub: 'vs last 30 days',
                color: GOLD,
              },
              {
                label: 'Orders',
                val: `${trends.ordersChange >= 0 ? '+' : ''}${trends.ordersChange}%`,
                sub: 'order movement',
                color: VIOLET,
              },
              {
                label: 'Growth',
                val: `${trends.usersChange >= 0 ? '+' : ''}${trends.usersChange}%`,
                sub: 'new customers',
                color: CYAN,
              },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                  {m.label}
                </p>
                <p
                  className="mt-1 font-heading text-2xl font-black tracking-tight"
                  style={{ color: m.color }}
                >
                  {m.val}
                </p>
                <p className="text-[11px] text-white/40">{m.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#FFD700] mb-2">
            Action Needed
          </p>
          <h2 className="font-heading text-xl font-black text-white mb-5">
            Priority Items
          </h2>
          <div className="space-y-2.5">
            {[
              {
                label: 'Pending orders',
                val: stats.pendingOrders,
                sub: 'Need confirmation',
                href: ROUTES.adminOrders,
                icon: Clock,
              },
              {
                label: 'Active products',
                val: stats.totalProducts,
                sub: 'In catalog',
                href: ROUTES.adminProducts,
                icon: Package,
              },
              {
                label: 'Review queue',
                val: charts.blockchainStats.pending + charts.blockchainStats.failed,
                sub: 'Pending verification',
                href: ROUTES.adminReviews,
                icon: MessageSquare,
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 transition-all hover:border-[#E63946]/40 hover:bg-white/[0.04] group"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#E63946]/15 p-2 text-[#E63946]">
                    <item.icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-white/40">{item.sub}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white">
                    {item.val}
                  </span>
                  <ArrowUpRight className="size-4 text-white/40 group-hover:text-[#E63946] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent orders */}
      <DashboardCard title="Recent Orders">
        <div className="space-y-2">
          {recentOrders.map((order) => (
            <Link
              key={order._id}
              href={ROUTES.adminOrder(order._id)}
              className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 transition-all hover:border-[#E63946]/40 hover:bg-white/[0.04] md:grid-cols-[1fr_auto_auto_auto] items-center"
            >
              <div>
                <p className="text-sm font-semibold text-white">{order.orderNumber}</p>
                <p className="text-xs text-white/40 font-mono">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: VIOLET }}
              >
                {formatPrice(order.totalAmount)}
              </span>
              <span className="text-xs text-white/50 capitalize">{order.paymentStatus}</span>
              <span className="rounded-full bg-[#E63946]/15 border border-[#E63946]/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E63946] capitalize">
                {order.status.replace(/_/g, ' ')}
              </span>
            </Link>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
