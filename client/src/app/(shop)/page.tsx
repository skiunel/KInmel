import type { Metadata } from 'next';
import { EditorialHome } from '@/components/home/editorial-home';

export const metadata: Metadata = {
  title: 'Kinmel Atelier',
  description:
    'Midnight editorial storefront with brutalist typography, dark luxury contrast, and cinematic product storytelling.',
  openGraph: {
    title: 'Kinmel Atelier',
    description:
      'Dark editorial fashion storefront with oversized typography, restrained motion, and sharper narrative commerce.',
    type: 'website',
  },
};

export default function HomePage() {
  return <EditorialHome />;
}
