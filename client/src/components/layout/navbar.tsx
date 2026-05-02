'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, ChevronDown, Search } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/providers/auth-provider';
import { useCartStore } from '@/stores/cart-store';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Products', href: ROUTES.products },
  { label: 'Reviews', href: '/verify' },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount, openDrawer, fetchCart } = useCartStore();
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthenticated) void fetchCart();
  }, [fetchCart, isAuthenticated]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease',
        }}
        className={cn(
          'fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 md:px-10 py-3.5 transition-all duration-300',
          scrolled
            ? 'bg-white/20 backdrop-blur-md border-b border-white/40 shadow-sm'
            : 'bg-transparent'
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="font-heading text-2xl font-black tracking-tighter text-[#18181B]">
            kinmel<span className="text-[#16a34a]">.</span>
          </span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-5 lg:gap-8">
          {/* Desktop Search */}
          <div className="hidden md:flex items-center relative group">
            <Search className="w-4 h-4 absolute left-3 text-[#a1a1aa] group-focus-within:text-[#16a34a] transition-colors" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-40 lg:w-64 h-9 pl-9 pr-4 rounded-full bg-[#f4f4f5] border border-transparent focus:bg-white focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10 text-[13px] text-[#18181B] placeholder-[#a1a1aa] outline-none transition-all"
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-[#71717a]">
            {NAV_LINKS.map(link => (
              <NL key={link.label} href={link.href} active={pathname === link.href}>{link.label}</NL>
            ))}
            {!isAuthenticated && (
              <>
                <span className="w-px h-4 bg-[#e4e4e7]" />
                <NL href={ROUTES.login}>Sign in</NL>
                <NL href={ROUTES.register} accent>Create account</NL>
              </>
            )}
          </nav>

          {/* User / CTA */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button className="flex md:hidden h-9 w-9 items-center justify-center rounded-full text-[#71717a] hover:bg-[#f4f4f5] hover:text-[#18181B] transition-colors">
                  <Search className="w-4 h-4" />
                </button>
                <ProfileDropdown />
              </div>
            ) : (
              <Link href={ROUTES.products} className="btn-primary !py-2 !px-5 !text-xs hidden sm:inline-flex">
                Browse products
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4e4e7] bg-white/80 text-[#3f3f46] hover:bg-[#f4f4f5] transition-all"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={cn(
          'fixed top-0 right-0 z-35 h-full w-72 bg-white border-l border-[#e4e4e7] shadow-2xl transform transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{ zIndex: 41 }}
      >
        <div className="pt-16 pb-6 px-6">
          <nav className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2 px-3">Browse</p>
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'flex items-center px-3 py-2.5 rounded-lg text-[13px] transition-all',
                  pathname === link.href
                    ? 'bg-[#16a34a]/8 text-[#16a34a] font-medium'
                    : 'text-[#71717a] hover:text-[#18181B] hover:bg-[#f4f4f5]'
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-[#e4e4e7] my-3" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2 px-3">Account</p>

            {isAuthenticated ? (
              <>
                <Link href={ROUTES.orders} className="flex items-center px-3 py-2.5 rounded-lg text-[13px] text-[#71717a] hover:text-[#18181B] hover:bg-[#f4f4f5] transition-all">
                  My Orders
                </Link>
                <Link href={ROUTES.account} className="flex items-center px-3 py-2.5 rounded-lg text-[13px] text-[#71717a] hover:text-[#18181B] hover:bg-[#f4f4f5] transition-all">
                  Account
                </Link>
                <button
                  onClick={() => void logout()}
                  className="flex items-center px-3 py-2.5 rounded-lg text-[13px] text-[#71717a] hover:text-red-500 hover:bg-red-50 transition-all text-left"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href={ROUTES.login} className="flex items-center px-3 py-2.5 rounded-lg text-[13px] text-[#71717a] hover:text-[#18181B] hover:bg-[#f4f4f5] transition-all">
                  Sign in
                </Link>
                <Link href={ROUTES.register} className="mt-2 btn-primary !text-xs text-center justify-center">
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Cart FAB */}
      <button
        onClick={openDrawer}
        style={{ transform: visible ? 'scale(1)' : 'scale(0)', transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.2s' }}
        className="fixed right-5 bottom-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white border border-[#e4e4e7] text-[#3f3f46] shadow-lg hover:shadow-xl hover:border-[rgba(22,163,74,0.3)] transition-all duration-300 group"
      >
        <ShoppingCart className="h-4.5 w-4.5 group-hover:text-[#16a34a] transition-colors" />
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#16a34a] text-[10px] font-bold text-white">
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
      </button>
    </>
  );
}

function NL({ href, children, accent, active }: { href: string; children: React.ReactNode; accent?: boolean; active?: boolean }) {
  return (
    <Link href={href} className={cn(
      'relative group transition-colors duration-200',
      accent ? 'text-[#16a34a] font-medium' : active ? 'text-[#18181B] font-medium' : 'hover:text-[#18181B]'
    )}>
      {children}
      <span className={cn(
        'absolute -bottom-0.5 left-0 h-[1.5px] rounded-full transition-all duration-300',
        accent ? 'bg-[#16a34a] w-full' : active ? 'bg-[#16a34a] w-full' : 'w-0 bg-[#18181B] group-hover:w-full'
      )} />
    </Link>
  );
}

function ProfileDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const h = () => setOpen(false);
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, [open]);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative hidden sm:block" onClick={(e) => e.stopPropagation()}>
      <button 
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-gradient-to-br from-[#16a34a]/20 to-[#22c55e]/20 overflow-hidden hover:shadow-md transition-all ring-1 ring-black/5"
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-heading text-sm font-bold text-[#16a34a]">{initials}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-[#e4e4e7] shadow-xl overflow-hidden py-2 z-50">
          <div className="px-4 py-3 border-b border-[#e4e4e7] mb-1">
            <p className="text-sm font-bold text-[#18181B] truncate">{user.name}</p>
            <p className="text-xs text-[#71717a] truncate">{user.email}</p>
          </div>
          <Link href={ROUTES.account} onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-[#3f3f46] hover:bg-[#f4f4f5] transition-colors">
            Account Details
          </Link>
          <Link href={ROUTES.orders} onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-[#3f3f46] hover:bg-[#f4f4f5] transition-colors">
            My Orders
          </Link>
          <div className="h-px bg-[#e4e4e7] my-1" />
          <button onClick={() => { setOpen(false); void logout(); }} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

