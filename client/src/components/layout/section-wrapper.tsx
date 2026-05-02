import { cn } from '@/lib/utils';
import { Container } from './container';
import type { ReactNode } from 'react';

interface SectionWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  background?: 'white' | 'slate' | 'gradient';
  className?: string;
  containerSize?: 'default' | 'narrow' | 'wide';
}

const bgClasses = {
  white: 'bg-white',
  slate: 'bg-muted/50',
  gradient: 'bg-gradient-to-br from-primary/5 via-background to-[oklch(0.60_0.22_295)]/5',
};

export function SectionWrapper({
  children,
  title,
  subtitle,
  background = 'white',
  className,
  containerSize = 'default',
}: SectionWrapperProps) {
  return (
    <section className={cn('py-16 sm:py-20 lg:py-24', bgClasses[background], className)}>
      <Container size={containerSize}>
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
