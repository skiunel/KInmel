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
  'h-12 w-full rounded-xl border border-[rgba(255,255,255,0.1)] bg-white/[0.04] px-4 text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-[#6C63FF]/60 focus:shadow-[0_0_0_3px_rgba(108,99,255,0.12)] pr-10';
const labelCls = 'text-xs font-medium text-white/65 uppercase tracking-widest';

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
        <h2 className="font-heading text-3xl font-black tracking-tight text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-white/55">
          Sign in to your Kinmel account
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => login.mutate(d))} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelCls}>
            Email address
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
            <p className="text-xs text-[#EF4444]">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className={labelCls}>
              Password
            </label>
            <Link
              href={ROUTES.forgotPassword}
              className="text-xs text-[#00F5FF] hover:text-[#5EE9FF] transition-colors"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/65 transition-colors"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-[#EF4444]">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={login.isPending}
          className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#5448E0] text-sm font-bold text-white shadow-[0_4px_24px_rgba(108,99,255,0.35)] transition-all hover:shadow-[0_4px_32px_rgba(108,99,255,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
        >
          {login.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[rgba(255,255,255,0.1)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 text-white/40 bg-[#09090B] font-mono uppercase tracking-widest">
            or continue with
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <MetaMaskConnect />
        {GOOGLE_AUTH_ENABLED && <GoogleLoginButton />}
      </div>

      <p className="text-center text-sm text-white/55">
        Don&apos;t have an account?{' '}
        <Link
          href={ROUTES.register}
          className="text-[#6C63FF] hover:text-[#8B7FFF] transition-colors font-semibold"
        >
          Create one
        </Link>
      </p>

      <p className="text-center text-xs text-white/30">
        <Link href="/admin/login" className="hover:text-white/55 transition-colors">
          Admin access →
        </Link>
      </p>
    </div>
  );
}
