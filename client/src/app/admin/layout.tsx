'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardList, LayoutDashboard, LogOut, MessageSquare,
  Package, Search, Settings2, Shield, Store, Users,
  type LucideIcon,
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
      { label: 'Settings', href: ROUTES.adminSettings, icon: Settings2 },
    ],
  },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const logout = useLogout();

  if (pathname === ROUTES.adminLogin) return <>{children}</>;

  const allItems = navGroups.flatMap(g => [...g.items]);
  const current = allItems.find(i => pathname === i.href) ?? allItems.find(i => i.href !== ROUTES.admin && pathname.startsWith(i.href)) ?? allItems[0];

  return (
    <AdminRoute>
      <div className="min-h-screen bg-[#FAFAF8] text-[#18181B]">
        <div className="flex flex-col lg:flex-row min-h-screen">

          {/* Sidebar */}
          <aside className="w-full lg:w-[260px] bg-white border-r border-[#e4e4e7] flex flex-col">
            <div className="p-5 flex items-center justify-between border-b border-[#e4e4e7]">
              <Link href={ROUTES.admin} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#16a34a] to-[#22c55e] flex items-center justify-center text-white font-heading text-xs font-extrabold">K</div>
                <span className="font-heading text-base font-extrabold tracking-tight">kinmel</span>
              </Link>
              <span className="text-[10px] font-semibold text-[#16a34a] bg-[#16a34a]/8 px-2.5 py-1 rounded-full border border-[#16a34a]/15">
                Admin
              </span>
            </div>

            <div className="p-3 flex-1 overflow-y-auto">
              {navGroups.map(g => (
                <div key={g.label} className="mb-6">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2 px-3">{g.label}</p>
                  <nav className="space-y-0.5">
                    {g.items.map(item => {
                      const active = pathname === item.href || (item.href !== ROUTES.admin && pathname.startsWith(item.href));
                      return (
                        <Link key={item.href} href={item.href}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150',
                            active
                              ? 'bg-[#16a34a]/8 text-[#16a34a] font-medium'
                              : 'text-[#71717a] hover:text-[#18181B] hover:bg-[#f4f4f5]'
                          )}
                        >
                          <item.icon className="size-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#e4e4e7]">
              <div className="mb-3 px-2">
                <p className="text-sm font-medium truncate text-[#18181B]">{user?.name ?? 'Admin'}</p>
                <p className="text-xs text-[#a1a1aa] truncate">{user?.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href={ROUTES.home} className="flex items-center justify-center gap-1.5 rounded-lg border border-[#e4e4e7] py-2 text-[11px] font-medium text-[#71717a] hover:bg-[#f4f4f5] transition-all">
                  <Store className="size-3" /> Store
                </Link>
                <button onClick={() => logout.mutate()} disabled={logout.isPending}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-[#e4e4e7] py-2 text-[11px] font-medium text-[#71717a] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all disabled:opacity-50">
                  <LogOut className="size-3" /> {logout.isPending ? '...' : 'Log out'}
                </button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
            <div className="mb-8 pb-5 border-b border-[#e4e4e7] flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-[#16a34a]" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a1a1aa]">Administration</p>
                </div>
                <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight">{current.label}</h1>
              </div>
              <div className="relative w-full md:w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#a1a1aa]" />
                <input type="text" placeholder="Search..." className="w-full rounded-lg border border-[#e4e4e7] bg-white py-2 pl-9 pr-3 text-xs outline-none placeholder:text-[#a1a1aa] focus:border-[rgba(22,163,74,0.3)] transition-all" />
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>
    </AdminRoute>
  );
}
