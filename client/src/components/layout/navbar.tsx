'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/providers/auth-provider';
import { useCartStore } from '@/stores/cart-store';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: ROUTES.products },
  { label: 'Reviews', href: '/verify' },
  { label: 'About', href: '/about' },
];

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { itemCount, openDrawer, fetchCart } = useCartStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthenticated) void fetchCart();
  }, [fetchCart, isAuthenticated]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed z-40 transition-all duration-500 left-1/2 -translate-x-1/2',
          scrolled
            ? 'top-3 w-[min(96%,1400px)] rounded-2xl bg-[#0B0B0D]/55 backdrop-blur-2xl border border-[#EDE7DA]/10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6),0_1px_0_rgba(237,231,218,0.06)_inset]'
            : 'top-4 w-[min(96%,1400px)] rounded-2xl bg-[#0B0B0D]/30 backdrop-blur-xl border border-[#EDE7DA]/8'
        )}
      >
        <div className="flex items-center justify-between px-5 lg:px-7 h-14">
          {/* Logo */}
          <Link
            href="/"
            className="font-heading text-lg font-black uppercase tracking-[0.18em] text-white"
          >
            Kinmel
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10 text-[11px] font-semibold uppercase tracking-[0.2em]">
            {NAV_LINKS.map((link) => (
              <NL key={link.label} href={link.href} active={pathname === link.href}>
                {link.label}
              </NL>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Search"
              className="h-10 w-10 inline-flex items-center justify-center text-[#EDE7DA]/60 hover:text-[#FF3D00] transition-colors"
            >
              <Search className="size-4" />
            </button>

            <button
              onClick={openDrawer}
              aria-label="Cart"
              className="relative h-10 w-10 inline-flex items-center justify-center text-[#EDE7DA]/60 hover:text-[#FF3D00] transition-colors"
            >
              <ShoppingCart className="size-4" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 size-4 inline-flex items-center justify-center rounded-full bg-white text-[9px] font-bold text-black">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <Link
                href={ROUTES.login}
                className="hidden sm:inline-flex h-10 items-center px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white border border-white/20 hover:bg-white hover:text-black transition-all"
              >
                Sign in
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
              className="lg:hidden h-10 w-10 inline-flex items-center justify-center text-white"
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={cn(
          'fixed top-0 right-0 z-40 h-full w-72 bg-black border-l border-[#EDE7DA]/8 transform transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="pt-20 px-8">
          <nav className="flex flex-col gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'text-sm font-semibold uppercase tracking-[0.22em] transition-colors',
                  pathname === link.href ? 'text-white' : 'text-[#EDE7DA]/45 hover:text-[#FF3D00]'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-white/10 my-4" />
            {isAuthenticated ? (
              <button
                onClick={() => void logout()}
                className="text-left text-sm font-semibold uppercase tracking-[0.22em] text-[#EDE7DA]/45 hover:text-[#FF3D00] transition-colors"
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  href={ROUTES.login}
                  className="text-sm font-semibold uppercase tracking-[0.22em] text-white"
                >
                  Sign in
                </Link>
                <Link
                  href={ROUTES.register}
                  className="text-sm font-semibold uppercase tracking-[0.22em] text-[#EDE7DA]/45 hover:text-[#FF3D00] transition-colors"
                >
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}

function NL({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'relative transition-colors duration-200',
        active ? 'text-white' : 'text-[#EDE7DA]/45 hover:text-[#FF3D00]'
      )}
    >
      {children}
    </Link>
  );
}

function ProfileDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

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
        className="h-9 w-9 inline-flex items-center justify-center border border-white/20 text-white hover:border-white transition-colors"
      >
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name}
            width={36}
            height={36}
            unoptimized
            className="object-cover"
          />
        ) : (
          <span className="font-heading text-xs font-bold">{initials}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-black border border-[#EDE7DA]/8 py-2 z-50">
          <div className="px-4 py-3 border-b border-[#EDE7DA]/8">
            <p className="text-xs font-bold uppercase tracking-widest text-white">
              {user.name}
            </p>
            <p className="text-[10px] text-white/40 truncate">{user.email}</p>
          </div>
          <Link
            href={ROUTES.account}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#EDE7DA]/60 hover:text-[#FF3D00] hover:bg-white/5 transition-colors"
          >
            Account
          </Link>
          <Link
            href={ROUTES.orders}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#EDE7DA]/60 hover:text-[#FF3D00] hover:bg-white/5 transition-colors"
          >
            Orders
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              void logout();
            }}
            className="w-full text-left block px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
