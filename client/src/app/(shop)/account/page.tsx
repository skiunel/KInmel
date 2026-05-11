'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  Mail,
  Save,
  Upload,
  Package,
  LayoutDashboard,
  ShoppingBag,
  Star,
  Wallet,
  Settings,
  Bell,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth';
import { useOrders } from '@/hooks/use-orders';
import { useAuth } from '@/providers/auth-provider';
import { useWallet } from '@/hooks/use-wallet';
import { ROUTES } from '@/lib/constants';
import { formatDate, formatPrice, cn } from '@/lib/utils';
import { profileService } from '@/services/profile.service';
import { useMutation } from '@tanstack/react-query';
import { showToast } from '@/lib/toast';
import { shortenAddress, buildExplorerAddressUrl } from '@/lib/runtime-config';

type TabKey = 'overview' | 'orders' | 'reviews' | 'wallet' | 'settings';

const NAV: { id: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'My Orders', icon: ShoppingBag },
  { id: 'reviews', label: 'My Reviews', icon: Star },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function AccountPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>('overview');

  if (!user) return null;
  const initials = getInitials(user.name);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#09090B] pt-20 pb-16">
        {/* Subtle gradient top */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#6C63FF]/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 right-0 w-72 h-72 bg-[#00F5FF]/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-[1300px] mx-auto px-4 md:px-8">
          {/* Top profile bar */}
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#111113] p-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-xl border border-[rgba(255,255,255,0.1)] bg-gradient-to-br from-[#6C63FF]/20 to-[#00F5FF]/20 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.name} width={48} height={48} unoptimized className="object-cover" />
                  ) : (
                    <span className="font-heading text-base font-bold text-white">{initials}</span>
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-[#22C55E] border-2 border-[#111113]" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{user.name}</p>
                <p className="text-xs text-white/55">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative h-9 w-9 inline-flex items-center justify-center rounded-xl border border-[rgba(255,255,255,0.1)] bg-white/[0.04] text-white/55 hover:text-white transition-colors">
                <Bell className="size-4" />
                <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#EF4444]" />
              </button>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
            {/* Sidebar */}
            <aside className="h-fit lg:sticky lg:top-24">
              <div className="rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#111113] p-2">
                <nav className="flex flex-col gap-1">
                  {NAV.map((item) => {
                    const Icon = item.icon;
                    const active = tab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setTab(item.id)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                          active
                            ? 'bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/20'
                            : 'text-white/55 hover:text-white hover:bg-white/[0.04] border border-transparent'
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        {item.label}
                        {active && <ChevronRight className="size-3 ml-auto opacity-60" />}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Main */}
            <main className="flex flex-col gap-5">
              {tab === 'overview' && <OverviewTab />}
              {tab === 'orders' && <OrdersTab />}
              {tab === 'reviews' && <ReviewsTab />}
              {tab === 'wallet' && <WalletTab />}
              {tab === 'settings' && <SettingsTab />}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#111113]', className)}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-heading text-lg font-black text-white">{children}</h3>
  );
}

function OverviewTab() {
  const { data: ordersData } = useOrders({ page: 1, limit: 5, sort: 'newest' });
  const orders = ordersData?.data ?? [];

  const kpis = [
    { label: 'Orders', value: ordersData?.pagination.total ?? 0, color: '#6C63FF', bg: 'rgba(108,99,255,0.08)', border: 'rgba(108,99,255,0.2)' },
    { label: 'Reviews', value: 0, color: '#00F5FF', bg: 'rgba(0,245,255,0.08)', border: 'rgba(0,245,255,0.2)' },
    { label: 'Wallet', value: '0 POL', color: '#22C55E', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
    { label: 'Points', value: '320', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl p-5"
            style={{ background: k.bg, border: `1px solid ${k.border}` }}
          >
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-2">
              {k.label}
            </p>
            <p className="font-heading text-3xl font-black" style={{ color: k.color }}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Recent Orders</SectionTitle>
          <Link
            href={ROUTES.orders}
            className="text-xs text-[#6C63FF] hover:text-[#8B7FFF] transition-colors font-semibold flex items-center gap-1"
          >
            View all <ChevronRight className="size-3" />
          </Link>
        </div>
        {orders.length === 0 ? (
          <EmptyState message="No orders yet" />
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <OrderRow key={o._id} order={o} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function OrdersTab() {
  const { data: ordersData, isLoading } = useOrders({ page: 1, limit: 20, sort: 'newest' });
  const orders = ordersData?.data ?? [];

  if (isLoading) {
    return (
      <Card className="p-12 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[#6C63FF]" />
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <SectionTitle>All Orders</SectionTitle>
      <div className="mt-4">
        {orders.length === 0 ? (
          <EmptyState message="No orders yet" />
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <OrderRow key={o._id} order={o} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function OrderRow({
  order,
}: {
  order: {
    _id: string;
    orderNumber: string;
    createdAt: string;
    totalAmount: number;
    status: string;
  };
}) {
  const statusStyle: Record<string, { bg: string; text: string }> = {
    delivered: { bg: 'rgba(34,197,94,0.1)', text: '#22C55E' },
    shipped: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
    processing: { bg: 'rgba(0,245,255,0.1)', text: '#5EE9FF' },
    pending: { bg: 'rgba(255,255,255,0.05)', text: '#71717A' },
    confirmed: { bg: 'rgba(108,99,255,0.1)', text: '#6C63FF' },
    cancelled: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444' },
  };
  const s = statusStyle[order.status] ?? statusStyle.pending;
  return (
    <Link
      href={ROUTES.order(order._id)}
      className="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.1)] bg-white/[0.04] hover:border-[#6C63FF]/30 transition-all group"
    >
      <div>
        <p className="text-sm font-bold text-white group-hover:text-[#6C63FF] transition-colors">
          {order.orderNumber}
        </p>
        <p className="text-xs text-white/40 mt-0.5 font-mono">
          {formatDate(order.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm font-semibold text-white">
          {formatPrice(order.totalAmount)}
        </span>
        <span
          className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{ background: s.bg, color: s.text }}
        >
          {order.status.replace(/_/g, ' ')}
        </span>
        <ChevronRight className="size-4 text-white/30 group-hover:text-[#6C63FF] transition-colors" />
      </div>
    </Link>
  );
}

function ReviewsTab() {
  return (
    <Card className="p-5">
      <SectionTitle>My Reviews</SectionTitle>
      <div className="mt-4">
        <EmptyState message="No reviews published yet. Reviews you sign on-chain will appear here." />
      </div>
    </Card>
  );
}

function WalletTab() {
  const wallet = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!wallet.address) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <SectionTitle>Connected Wallet</SectionTitle>
        <p className="text-sm text-white/55 mt-1 mb-5">
          Your wallet signs signed reviews.
        </p>

        {wallet.isConnected && wallet.address ? (
          <div className="space-y-3">
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.2)' }}
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#6C63FF] mb-2">
                Address
              </p>
              <div className="flex items-center justify-between">
                <a
                  href={buildExplorerAddressUrl(wallet.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-white hover:text-[#6C63FF] transition-colors flex items-center gap-1.5"
                >
                  {shortenAddress(wallet.address, 8)}
                  <ExternalLink className="size-3" />
                </a>
                <button
                  onClick={handleCopy}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-[rgba(255,255,255,0.1)] bg-white/[0.04] text-white/55 hover:text-white transition-colors"
                >
                  {copied ? <Check className="size-3.5 text-[#22C55E]" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-white/[0.04] p-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">
                  Network
                </p>
                <p className="text-sm font-bold" style={{ color: wallet.isOnAmoy ? '#22C55E' : '#EF4444' }}>
                  {wallet.isOnAmoy ? '● Polygon Amoy' : '● Wrong network'}
                </p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
              >
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#F59E0B] mb-1.5">
                  Review Tokens
                </p>
                <p className="text-2xl font-black text-[#F59E0B]">0</p>
              </div>
            </div>

            {!wallet.isOnAmoy && (
              <button
                onClick={wallet.switchToAmoy}
                className="w-full h-10 rounded-xl border border-[rgba(255,255,255,0.1)] bg-white/[0.04] text-sm font-semibold text-white/55 hover:text-white hover:border-[#6C63FF]/40 transition-all"
              >
                Switch to Polygon Amoy
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={wallet.connect}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#5448E0] text-sm font-bold text-white shadow-[0_4px_24px_rgba(108,99,255,0.3)] hover:shadow-[0_4px_32px_rgba(108,99,255,0.45)] transition-all"
          >
            <span>🦊</span>
            Connect MetaMask Wallet
          </button>
        )}
      </Card>
    </div>
  );
}

function SettingsTab() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      showToast.success('Profile updated successfully');
    },
    onError: (err: unknown) => {
      showToast.error(err instanceof Error ? err.message : 'Failed to update profile');
    },
  });

  if (!user) return null;
  const initials = getInitials(user.name);
  const inputCls = 'h-11 w-full rounded-xl border border-[rgba(255,255,255,0.1)] bg-white/[0.04] px-4 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-[#6C63FF]/50 focus:shadow-[0_0_0_3px_rgba(108,99,255,0.1)]';

  const handleSave = () => updateProfile.mutate({ name, phone });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast.error('Image must be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateProfile.mutate({ avatar: base64 });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Avatar card */}
      <Card className="p-5">
        <SectionTitle>Profile Photo</SectionTitle>
        <div className="mt-4 flex items-center gap-5">
          <div className="relative h-20 w-20 shrink-0 rounded-2xl border border-[rgba(255,255,255,0.1)] bg-gradient-to-br from-[#6C63FF]/20 to-[#00F5FF]/20 flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <Image src={user.avatar} alt={user.name} fill unoptimized className="object-cover" />
            ) : (
              <span className="font-heading text-2xl font-bold text-white">{initials}</span>
            )}
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={updateProfile.isPending}
              className="flex h-9 items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-white/[0.04] px-4 text-xs font-semibold text-white/65 hover:text-white hover:border-[#6C63FF]/40 transition-all disabled:opacity-50"
            >
              <Upload className="size-3.5" />
              {updateProfile.isPending ? 'Updating...' : 'Upload Photo'}
            </button>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-white/40">
              <Mail className="size-3" /> {user.email}
            </div>
          </div>
        </div>
      </Card>

      {/* Personal info */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Personal Info</SectionTitle>
          <button
            onClick={handleSave}
            disabled={updateProfile.isPending || (name === user.name && phone === user.phone)}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#5448E0] px-4 text-xs font-bold text-white shadow-[0_2px_12px_rgba(108,99,255,0.3)] transition-all hover:shadow-[0_2px_16px_rgba(108,99,255,0.45)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="size-3.5" /> Save
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-white/65 uppercase tracking-widest mb-1.5 block">
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/65 uppercase tracking-widest mb-1.5 block">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+977 98XXXXXXXX"
              className={inputCls}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-white/65 uppercase tracking-widest mb-1.5 block">
              Email (cannot be changed)
            </label>
            <input
              value={user.email}
              disabled
              className={cn(inputCls, 'opacity-50 cursor-not-allowed')}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-[rgba(255,255,255,0.1)]">
      <Package className="size-7 text-white/30 mb-3" />
      <p className="text-sm text-white/40">{message}</p>
    </div>
  );
}
