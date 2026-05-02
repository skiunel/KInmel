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

export function PageHeader({
  title,
  description,
  breadcrumbs,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('px-3 pt-2 sm:px-5', className)}>
      <Container className="max-w-[92rem] px-0">
        <div className="storefront-shell p-4 sm:p-5">
          <div className="storefront-panel relative px-6 py-7 sm:px-8 sm:py-8">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
                {breadcrumbs.map((crumb, index) => (
                  <span key={index} className="flex items-center gap-1.5">
                    {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="transition-colors hover:text-slate-900"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="font-medium text-slate-900">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="storefront-kicker">Storefront page</p>
                <h1 className="mt-3 text-[clamp(2.3rem,5vw,4rem)] font-semibold tracking-[-0.05em] text-slate-900">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                    {description}
                  </p>
                ) : null}
              </div>
              {children ? <div className="flex shrink-0 items-center gap-3">{children}</div> : null}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
