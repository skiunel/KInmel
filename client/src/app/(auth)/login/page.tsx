import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth';

export const metadata: Metadata = {
  title: 'Login | Kinmel',
  description: 'Sign in to your Kinmel account.',
};

export default function LoginPage() {
  return <LoginForm />;
}
