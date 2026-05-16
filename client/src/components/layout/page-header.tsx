import { cn } from '@/lib/utils';
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
    <div className={cn('bg-white border-b border-[#0A0A0A]/10', className)}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 pt-24 pb-10">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-5 flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/45">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1.5">
                {index > 0 && <ChevronRight className="h-3 w-3" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[#E63946] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[#0A0A0A]/75">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-sans text-4xl md:text-6xl font-black uppercase tracking-[-0.04em] text-[#0A0A0A] leading-[0.95]">
              {title}
            </h1>
            {description && (
              <p className="mt-4 max-w-2xl text-sm text-[#0A0A0A]/60 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {children && <div className="flex shrink-0 items-center gap-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}
