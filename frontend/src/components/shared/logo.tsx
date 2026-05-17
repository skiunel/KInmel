import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
  showText?: boolean;
  className?: string;
}

const markSizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const textSizes = {
  sm: 'text-sm tracking-[0.08em]',
  md: 'text-base tracking-[0.1em]',
  lg: 'text-lg tracking-[0.12em]',
};

function KinmelMark({ size, variant }: { size: LogoProps['size']; variant: LogoProps['variant'] }) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[0.95rem] border',
        markSizes[size ?? 'md'],
        variant === 'white'
          ? 'border-white/20 bg-white/6'
          : 'border-black/10 bg-black text-white'
      )}
      aria-hidden="true"
    >
      <span
        className={cn(
          'absolute inset-y-0 right-0 w-[42%]',
          variant === 'white' ? 'bg-white text-black' : 'bg-[#f5f1eb] text-black'
        )}
      />
      <span className="absolute left-1/2 top-1/2 h-[74%] w-px -translate-x-1/2 -translate-y-1/2 bg-[#c92222]" />
      <span
        className={cn(
          'relative z-10 text-[0.78rem] font-black tracking-[0.12em]',
          variant === 'white' ? 'text-white' : 'text-white'
        )}
      >
        K
      </span>
    </span>
  );
}

export function Logo({
  size = 'md',
  variant = 'default',
  showText = true,
  className,
}: LogoProps) {
  return (
    <Link href="/" className={cn('inline-flex items-center gap-3', className)}>
      <KinmelMark size={size} variant={variant} />
      {showText ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'font-sans font-semibold',
              textSizes[size],
              variant === 'white' ? 'text-white' : 'text-foreground'
            )}
          >
            Kinmel
          </span>
          <span
            className={cn(
              'mt-1 text-[0.58rem] tracking-[0.12em]',
              variant === 'white' ? 'text-white/54' : 'text-black/45'
            )}
          >
            Street Atelier
          </span>
        </span>
      ) : null}
    </Link>
  );
}
