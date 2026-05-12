'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/providers/auth-provider';
import { useCartStore } from '@/stores/cart-store';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Shop', href: ROUTES.products },
  { label: 'Ledger', href: '/verify' },
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
          'fixed inset-x-0 top-0 z-40 transition-all duration-300 bg-white',
          scrolled ? 'border-b border-[#0A0A0A]/10 shadow-[0_1px_0_rgba(0,0,0,0.02)]' : 'border-b border-transparent'
        )}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 lg:px-10 h-14">
          <Link
            href="/"
            className="font-sans text-base font-black uppercase tracking-[-0.02em] text-[#0A0A0A]"
          >
            Kinmel<span className="text-[#E63946]">®</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">
            {NAV_LINKS.map((link) => (
              <NL key={link.label} href={link.href} active={pathname === link.href}>
                {link.label}
              </NL>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={openDrawer}
              aria-label="Cart"
              className="relative inline-flex items-center gap-2 text-[#0A0A0A] hover:text-[#E63946] transition-colors font-mono text-[11px] font-semibold uppercase tracking-[0.18em]"
            >
              <ShoppingBag className="size-4" />
              <span className="hidden sm:inline">Bag ({itemCount})</span>
            </button>

            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <Link
                href={ROUTES.login}
                className="hidden sm:inline-flex items-center font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A0A0A] hover:text-[#E63946] transition-colors"
              >
                Sign in
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
              className="lg:hidden h-8 w-8 inline-flex items-center justify-center text-[#0A0A0A]"
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#0A0A0A]/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={cn(
          'fixed top-0 right-0 z-40 h-full w-72 bg-white border-l border-[#0A0A0A]/10 transform transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="pt-20 px-8">
          <nav className="flex flex-col gap-5 font-mono text-[12px] font-semibold uppercase tracking-[0.2em]">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'transition-colors',
                  pathname === link.href ? 'text-[#0A0A0A]' : 'text-[#0A0A0A]/45 hover:text-[#E63946]'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-[#0A0A0A]/10 my-3" />
            {isAuthenticated ? (
              <button
                onClick={() => void logout()}
                className="text-left text-[#0A0A0A]/45 hover:text-[#E63946] transition-colors"
              >
                Log out
              </button>
            ) : (
              <>
                <Link href={ROUTES.login} className="text-[#0A0A0A]">
                  Sign in
                </Link>
                <Link
                  href={ROUTES.register}
                  className="text-[#0A0A0A]/45 hover:text-[#E63946] transition-colors"
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
        'transition-colors duration-200',
        active ? 'text-[#0A0A0A]' : 'text-[#0A0A0A]/55 hover:text-[#E63946]'
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
        className="h-8 w-8 inline-flex items-center justify-center border border-[#0A0A0A]/15 text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors"
      >
        {user.avatar ? (
          <Image src={user.avatar} alt={user.name} width={32} height={32} unoptimized className="object-cover" />
        ) : (
          <span className="font-mono text-[10px] font-bold">{initials}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-[#0A0A0A]/10 py-2 z-50 shadow-lg">
          <div className="px-4 py-3 border-b border-[#0A0A0A]/10">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">
              {user.name}
            </p>
            <p className="text-[10px] text-[#0A0A0A]/45 truncate">{user.email}</p>
          </div>
          <Link
            href={ROUTES.account}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-[#0A0A0A]/60 hover:text-[#E63946] hover:bg-[#F4F4F4] transition-colors"
          >
            Account
          </Link>
          <Link
            href={ROUTES.orders}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-[#0A0A0A]/60 hover:text-[#E63946] hover:bg-[#F4F4F4] transition-colors"
          >
            Orders
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              void logout();
            }}
            className="w-full text-left block px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-[#0A0A0A]/45 hover:text-[#E63946] hover:bg-[#F4F4F4] transition-colors"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
