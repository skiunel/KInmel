import { HyperLoader } from '@/components/ui/hyper-loader';

export const metadata = {
  title: 'Processing Request | Kinmel',
  description: 'System loading state demonstration',
};

export default function LoadingDemoPage() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <HyperLoader theme="dark" />
    </main>
  );
}
