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
      { label: 'Ledger', href: '/admin/blockchain', icon: Activity },
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
      <div className="min-h-screen bg-[#F4F4F4]">
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Sidebar */}
          <aside className="w-full lg:w-[240px] bg-white border-r border-[#0A0A0A]/10 flex flex-col lg:fixed lg:inset-y-0 lg:left-0 z-30">
            <div className="px-6 h-16 flex items-center justify-between border-b border-[#0A0A0A]/10">
              <Link href={ROUTES.admin} className="font-sans text-base font-black uppercase tracking-[-0.02em] text-[#0A0A0A]">
                Kinmel<span className="text-[#E63946]">®</span>
              </Link>
              <span className="font-mono text-[9px] font-semibold text-[#0A0A0A] bg-[#0A0A0A]/5 px-2 py-1 uppercase tracking-[0.18em]">
                Admin
              </span>
            </div>

            <div className="px-3 py-5 flex-1 overflow-y-auto">
              {navGroups.map((g) => (
                <div key={g.label} className="mb-6">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0A0A0A]/40 mb-2 px-3">
                    ◆ {g.label}
                  </p>
                  <nav className="space-y-0.5">
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
                            'flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors',
                            active
                              ? 'bg-[#0A0A0A] text-white font-medium'
                              : 'text-[#0A0A0A]/65 hover:bg-[#F4F4F4] hover:text-[#0A0A0A]'
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

            <div className="px-4 py-4 border-t border-[#0A0A0A]/10">
              <div className="mb-3 px-2">
                <p className="text-sm font-semibold truncate text-[#0A0A0A]">
                  {user?.name ?? 'Admin'}
                </p>
                <p className="text-xs text-[#0A0A0A]/45 truncate">{user?.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={ROUTES.home}
                  className="flex items-center justify-center gap-1.5 border border-[#0A0A0A]/15 py-2 text-[10px] font-mono uppercase tracking-[0.18em] font-semibold text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-colors"
                >
                  <Store className="size-3" /> Store
                </Link>
                <button
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                  className="flex items-center justify-center gap-1.5 border border-[#0A0A0A]/15 py-2 text-[10px] font-mono uppercase tracking-[0.18em] font-semibold text-[#0A0A0A] hover:bg-[#E63946] hover:text-white hover:border-[#E63946] transition-colors disabled:opacity-50"
                >
                  <LogOut className="size-3" /> {logout.isPending ? '…' : 'Log out'}
                </button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 lg:ml-[240px] overflow-x-hidden">
            <header className="sticky top-0 z-20 bg-white border-b border-[#0A0A0A]/10 h-16 flex items-center px-6 lg:px-10">
              <div className="flex-1 flex items-center justify-between gap-6">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#0A0A0A]/45">◆ Administration</p>
                  <h1 className="font-sans text-xl font-bold tracking-[-0.02em] text-[#0A0A0A]">
                    {current.label}
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-56 hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#0A0A0A]/40" />
                    <input
                      type="text"
                      placeholder="Search…"
                      className="w-full h-10 pl-9 border border-[#0A0A0A]/15 bg-white text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/35 outline-none focus:border-[#0A0A0A]"
                    />
                  </div>
                  <button className="relative h-10 w-10 inline-flex items-center justify-center border border-[#0A0A0A]/15 bg-white text-[#0A0A0A]/65 hover:text-[#0A0A0A] transition-colors">
                    <Bell className="size-4" />
                    <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#E63946]" />
                  </button>
                </div>
              </div>
            </header>
            <div className="p-6 lg:p-10">{children}</div>
          </main>
        </div>
      </div>
    </AdminRoute>
  );
}
