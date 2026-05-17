import { LoadingSpinner } from './loading-spinner';

interface PageLoaderProps {
  text?: string;
}

export function PageLoader({ text }: PageLoaderProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <LoadingSpinner size="lg" className="text-primary" />
      {text && <p className="mt-4 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
