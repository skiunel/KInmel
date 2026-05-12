'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useLogin } from '@/hooks/use-auth-mutations';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { ROUTES } from '@/lib/constants';
import { GOOGLE_AUTH_ENABLED } from '@/lib/runtime-config';
import { GoogleLoginButton } from './google-login-button';
import { MetaMaskConnect } from './metamask-connect';

const inputCls =
  'h-12 w-full border border-[#0A0A0A]/15 bg-white px-4 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/35 outline-none transition-colors focus:border-[#0A0A0A] pr-10';
const labelCls = 'font-mono text-[10px] font-semibold text-[#0A0A0A]/55 uppercase tracking-[0.22em]';

export function LoginForm() {
  const [show, setShow] = useState(false);
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <div className="space-y-7">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#E63946] mb-3">◆ Sign in</p>
        <h2 className="font-sans text-3xl font-black uppercase tracking-[-0.03em] text-[#0A0A0A]">
          Welcome back.
        </h2>
        <p className="mt-2 text-sm text-[#0A0A0A]/55">Sign in to your Kinmel account.</p>
      </div>

      <form onSubmit={handleSubmit((d) => login.mutate(d))} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelCls}>
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className={inputCls}
            {...register('email')}
          />
          {errors.email && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#E63946]">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-baseline">
            <label htmlFor="password" className={labelCls}>
              Password
            </label>
            <Link
              href={ROUTES.forgotPassword}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0A0A0A]/55 hover:text-[#E63946] transition-colors"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={show ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className={inputCls}
              {...register('password')}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A0A0A]/40 hover:text-[#0A0A0A] transition-colors"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#E63946]">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={login.isPending}
          className="group flex h-12 w-full items-center justify-center gap-2 bg-[#0A0A0A] font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white hover:bg-[#E63946] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {login.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#0A0A0A]/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 font-mono text-[10px] text-[#0A0A0A]/40 bg-white uppercase tracking-[0.22em]">
            or continue with
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <MetaMaskConnect />
        {GOOGLE_AUTH_ENABLED && <GoogleLoginButton />}
      </div>

      <p className="text-center text-sm text-[#0A0A0A]/55">
        Don&apos;t have an account?{' '}
        <Link
          href={ROUTES.register}
          className="text-[#E63946] hover:text-[#0A0A0A] transition-colors font-semibold"
        >
          Create one
        </Link>
      </p>

      <p className="text-center font-mono text-[10px] text-[#0A0A0A]/30 uppercase tracking-[0.22em]">
        <Link href="/admin/login" className="hover:text-[#E63946] transition-colors">
          Admin access →
        </Link>
      </p>
    </div>
  );
}
