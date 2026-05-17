'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, LayoutTemplate, PackageCheck, Truck } from 'lucide-react';
import { Container } from './container';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const highlights = [
  { icon: LayoutTemplate, text: 'Professional storefront layout' },
  { icon: PackageCheck, text: 'Curated product selection' },
  { icon: Truck, text: 'Free shipping on orders over Rs. 5,000' },
];

export function AnnouncementBar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <div
      className={cn(
        'text-[12px] backdrop-blur-xl transition-colors',
        isHome
          ? 'relative z-40 border-b border-white/8 bg-[linear-gradient(90deg,rgba(9,9,11,0.78),rgba(78,16,20,0.48),rgba(9,9,11,0.78))] text-white/84'
          : 'border-b border-white/8 bg-[linear-gradient(90deg,rgba(11,11,14,0.98),rgba(26,10,12,0.98),rgba(11,11,14,0.98))] text-muted-foreground'
      )}
    >
      <Container>
        <div className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {highlights.map((item) => (
              <div
                key={item.text}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-3 py-1 shadow-[0_8px_24px_rgba(29,58,45,0.04)]',
                  isHome
                    ? 'border border-white/12 bg-black/12 text-white/88'
                    : 'border border-white/8 bg-white/[0.03]'
                )}
              >
                <item.icon className={cn('size-3.5', isHome ? 'text-white/90' : 'text-primary')} />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          <Link
            href={ROUTES.products}
            className={cn(
              'inline-flex items-center gap-1.5 font-semibold transition-colors',
              isHome ? 'text-white hover:text-white/80' : 'text-foreground hover:text-primary'
            )}
          >
            Browse catalog
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
