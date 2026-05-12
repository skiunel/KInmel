import { cn } from '@/lib/utils';
import { Container } from './container';
import type { ReactNode } from 'react';

interface SectionWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  background?: 'default' | 'subtle' | 'gradient';
  className?: string;
  containerSize?: 'default' | 'narrow' | 'wide';
}

const bgClasses = {
  default: '',
  subtle: 'bg-white/[0.02]',
  gradient: 'bg-gradient-to-br from-[#E63946]/5 via-transparent to-[#E63946]/5',
};

export function SectionWrapper({
  children,
  title,
  subtitle,
  background = 'default',
  className,
  containerSize = 'default',
}: SectionWrapperProps) {
  return (
    <section className={cn('py-16 sm:py-20 lg:py-24', bgClasses[background], className)}>
      <Container size={containerSize}>
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            {title && (
              <h2 className="font-heading text-3xl md:text-4xl font-black tracking-tight gradient-text">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mx-auto mt-3 max-w-2xl text-sm text-white/50">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
