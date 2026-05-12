'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Search,
  Settings2,
  Shield,
  Store,
  Users,
  Activity,
  Bell,
} from 'lucide-react';
import { AdminRoute } from '@/components/auth';
import { useLogout } from '@/hooks/use-auth-mutations';
import { useAuth } from '@/providers/auth-provider';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: ROUTES.admin, icon: LayoutDashboard },
      { label: 'Orders', href: ROUTES.adminOrders, icon: ClipboardList },
      { label: 'Products', href: ROUTES.adminProducts, icon: Package },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Users', href: ROUTES.adminUsers, icon: Users },
      { label: 'Reviews', href: ROUTES.adminReviews, icon: MessageSquare },
      { label: 'Blockchain', href: '/admin/blockchain', icon: Activity },
      { label: 'Settings', href: ROUTES.adminSettings, icon: Settings2 },
    ],
  },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const logout = useLogout();

  if (pathname === ROUTES.adminLogin) return <>{children}</>;

  const allItems = navGroups.flatMap((g) => [...g.items]);
  const current =
    allItems.find((i) => pathname === i.href) ??
    allItems.find((i) => i.href !== ROUTES.admin && pathname.startsWith(i.href)) ??
    allItems[0];

  return (
    <AdminRoute>
      <div className="relative min-h-screen text-white overflow-hidden">
        <div className="orb orb-violet -left-32 top-40 size-[24rem] opacity-30" />
        <div className="orb orb-cyan right-0 bottom-20 size-[20rem] opacity-30" />

        <div className="relative flex flex-col lg:flex-row min-h-screen">
          {/* Sidebar */}
          <aside className="w-full lg:w-[260px] glass-card !rounded-none !rounded-r-3xl border-l-0 border-t-0 border-b-0 flex flex-col">
            <div className="p-5 flex items-center justify-between border-b border-white/10">
              <Link href={ROUTES.admin} className="flex items-center gap-1.5">
                <span className="text-lg">⛓</span>
                <span className="font-heading text-base font-black tracking-tight text-white">
                  Kin<span className="text-[#E63946]">mel</span>
                </span>
              </Link>
              <span className="text-[10px] font-bold text-[#FFD700] bg-[#FFD700]/10 px-2.5 py-1 rounded-full border border-[#FFD700]/20 uppercase tracking-wider">
                Admin
              </span>
            </div>

            <div className="p-3 flex-1 overflow-y-auto">
              {navGroups.map((g) => (
                <div key={g.label} className="mb-6">
                  <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-white/40 mb-2 px-3">
                    {g.label}
                  </p>
                  <nav className="space-y-1">
                    {g.items.map((item) => {
                      const active =
                        pathname === item.href ||
                        (item.href !== ROUTES.admin && pathname.startsWith(item.href));
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] transition-all',
                            active
                              ? 'bg-[#E63946]/15 text-[#E63946] border border-[#E63946]/30 shadow-[0_0_16px_rgba(230,57,70,0.2)] font-medium'
                              : 'text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent'
                          )}
                        >
                          <Icon className="size-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="mb-3 px-2">
                <p className="text-sm font-bold truncate text-white">
                  {user?.name ?? 'Admin'}
                </p>
                <p className="text-xs text-white/40 truncate">{user?.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={ROUTES.home}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] py-2 text-[11px] font-medium text-white/60 hover:text-white hover:bg-white/[0.08] transition-all"
                >
                  <Store className="size-3" /> Store
                </Link>
                <button
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] py-2 text-[11px] font-medium text-white/60 hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10 hover:border-[#FF6B6B]/30 transition-all disabled:opacity-50"
                >
                  <LogOut className="size-3" /> {logout.isPending ? '...' : 'Log out'}
                </button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
            <div className="mb-8 pb-5 border-b border-white/10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3.5 h-3.5 text-[#FFD700]" />
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/50">
                    Administration
                  </p>
                </div>
                <h1 className="font-heading text-3xl md:text-4xl font-black tracking-tight text-white">
                  {current.label}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-full md:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="glass-input w-full !h-10 pl-9 text-xs"
                  />
                </div>
                <button className="relative h-10 w-10 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 hover:text-white transition-colors">
                  <Bell className="size-4" />
                  <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#FF6B6B] shadow-[0_0_8px_rgba(255,107,107,0.8)] animate-pulse" />
                </button>
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>
    </AdminRoute>
  );
}
