import { cn } from '@/lib/utils';
import { Container } from './container';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumbs, children, className }: PageHeaderProps) {
  return (
    <div className={cn('px-6 md:px-12 pt-32 pb-8', className)}>
      <Container className="max-w-[1400px] px-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-white/40 font-mono">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1.5">
                {index > 0 && <ChevronRight className="h-3 w-3" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-white transition-colors uppercase tracking-widest">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white/60 uppercase tracking-widest">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tight gradient-text">
              {title}
            </h1>
            {description && (
              <p className="mt-3 max-w-2xl text-sm text-white/50 leading-relaxed">{description}</p>
            )}
          </div>
          {children && <div className="flex shrink-0 items-center gap-3">{children}</div>}
        </div>
      </Container>
    </div>
  );
}
