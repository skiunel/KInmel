'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useLogin } from '@/hooks/use-auth-mutations';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { ROUTES } from '@/lib/constants';
import { GOOGLE_AUTH_ENABLED } from '@/lib/runtime-config';
import { GoogleLoginButton } from './google-login-button';

const inputCls = "h-11 w-full rounded-xl border border-[#e4e4e7] bg-white px-4 text-sm outline-none placeholder:text-[#a1a1aa] focus:border-[rgba(22,163,74,0.4)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.08)] transition-all";
const labelCls = "text-xs font-medium text-[#71717a]";

export function LoginForm() {
  const [show, setShow] = useState(false);
  const login = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-extrabold tracking-tight text-[#18181B]">Welcome back</h2>
        <p className="mt-1.5 text-sm text-[#71717a]">Sign in to your account</p>
      </div>

      <GoogleLoginButton />

      {GOOGLE_AUTH_ENABLED && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#e4e4e7]" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-[#a1a1aa]">or continue with</span></div>
        </div>
      )}

      <form onSubmit={handleSubmit((d) => login.mutate(d))} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelCls}>Email address</label>
          <input id="email" type="email" placeholder="you@example.com" autoComplete="email" className={inputCls} {...register('email')} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <label htmlFor="password" className={labelCls}>Password</label>
            <Link href={ROUTES.forgotPassword} className="text-xs text-[#16a34a] hover:underline">Forgot?</Link>
          </div>
          <div className="relative">
            <input id="password" type={show ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password" className={inputCls + " pr-10"} {...register('password')} />
            <button type="button" tabIndex={-1} onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#71717a] transition-colors">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={login.isPending} className="btn-primary w-full mt-1">
          {login.isPending ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="text-center text-sm text-[#71717a]">
          Don&apos;t have an account? <Link href={ROUTES.register} className="text-[#16a34a] hover:underline font-medium">Create one</Link>
        </p>

        <p className="text-center text-xs text-[#a1a1aa]">
          <Link href="/admin/login" className="hover:text-[#71717a] transition-colors">Admin access</Link>
        </p>
      </form>
    </div>
  );
}
