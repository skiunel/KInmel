import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  size?: 'default' | 'narrow' | 'wide';
  className?: string;
}

const sizeClasses = {
  default: 'max-w-7xl',
  narrow: 'max-w-3xl',
  wide: 'max-w-full',
};

export function Container({ children, size = 'default', className }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizeClasses[size], className)}>
      {children}
    </div>
  );
}
