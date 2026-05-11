import type { Metadata } from 'next';
import {
  FeaturedProducts,
  HeroSection,
  HowItWorks,
} from '@/components/home';

export const metadata: Metadata = {
  title: 'Kinmel — Reviews You Can Actually Trust',
  description:
    'A premium e-commerce platform where every review is signed with MetaMask and anchored on the Polygon blockchain. Verified buyers, immutable signatures, zero fake stars.',
  openGraph: {
    title: 'Kinmel — Reviews You Can Actually Trust',
    description:
      'Reviews you can trust for trusted e-commerce. Every review signed with MetaMask, anchored on Polygon Amoy.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <HowItWorks />
    </>
  );
}
