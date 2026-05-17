'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

const chipVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-primary/15 bg-primary/10 text-primary',
        verified: 'border-verified/20 bg-verified/15 text-verified',
        chain: 'border-chain/20 bg-chain/15 text-chain',
        success: 'border-success/20 bg-success/15 text-success',
        warning: 'border-warning/20 bg-warning/15 text-warning-foreground',
        destructive: 'border-destructive/15 bg-destructive/10 text-destructive',
        muted: 'border-border bg-muted/70 text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {
  onRemove?: () => void;
}

export function Chip({ className, variant, children, onRemove, ...props }: ChipProps) {
  return (
    <span className={cn(chipVariants({ variant }), className)} {...props}>
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors"
          aria-label="Remove"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}
