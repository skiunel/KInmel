import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth';

export const metadata: Metadata = {
  title: 'Create Account | Kinmel',
  description: 'Join Kinmel and start shopping with blockchain-verified reviews.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
