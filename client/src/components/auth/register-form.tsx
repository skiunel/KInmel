'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Check, X, Loader2, ArrowRight } from 'lucide-react';
import { useRegister } from '@/hooks/use-auth-mutations';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { ROUTES } from '@/lib/constants';
import { GOOGLE_AUTH_ENABLED } from '@/lib/runtime-config';
import { GoogleLoginButton } from './google-login-button';
import { MetaMaskConnect } from './metamask-connect';

const pwRules = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
];

const inputCls =
  'h-12 w-full rounded-xl border border-[rgba(255,255,255,0.1)] bg-white/[0.04] px-4 text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-[#00F5FF]/60 focus:shadow-[0_0_0_3px_rgba(0,245,255,0.12)] pr-10';
const labelCls = 'text-xs font-medium text-white/65 uppercase tracking-widest';

export function RegisterForm() {
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const reg = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const pw = watch('password', '');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-black tracking-tight text-white">
          Create account
        </h2>
        <p className="mt-2 text-sm text-white/55">
          Join the Kinmel community
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => reg.mutate(d))} className="space-y-3.5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={labelCls}>Full name</label>
          <input
            id="name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            className={inputCls}
            {...register('name')}
          />
          {errors.name && <p className="text-xs text-[#EF4444]">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelCls}>Email address</label>
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
          <label htmlFor="phone" className={labelCls}>Phone (optional)</label>
          <input
            id="phone"
            type="tel"
            placeholder="+977 98XXXXXXXX"
            autoComplete="tel"
            className={inputCls}
            {...register('phone')}
          />
          {errors.phone && (
            <p className="text-xs text-[#EF4444]">{errors.phone.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className={labelCls}>Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              className={inputCls}
              {...register('password')}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/65 transition-colors"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {pw.length > 0 && (
            <div className="mt-1 grid grid-cols-2 gap-1">
              {pwRules.map((r) => {
                const ok = r.test(pw);
                return (
                  <div key={r.label} className="flex items-center gap-1.5 text-[10px]">
                    {ok ? (
                      <Check className="h-3 w-3 text-[#22C55E]" />
                    ) : (
                      <X className="h-3 w-3 text-white/30" />
                    )}
                    <span className={ok ? 'text-[#22C55E]' : 'text-white/40'}>{r.label}</span>
                  </div>
                );
              })}
            </div>
          )}
          {errors.password && (
            <p className="text-xs text-[#EF4444]">{errors.password.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className={labelCls}>Confirm password</label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showCf ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              className={inputCls}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowCf(!showCf)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/65 transition-colors"
            >
              {showCf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-[#EF4444]">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={reg.isPending}
          className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#00F5FF] to-[#00C9D6] text-sm font-bold text-white shadow-[0_4px_24px_rgba(0,245,255,0.35)] transition-all hover:shadow-[0_4px_32px_rgba(0,245,255,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
        >
          {reg.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Create account
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
        Already have an account?{' '}
        <Link
          href={ROUTES.login}
          className="text-[#6C63FF] hover:text-[#8B7FFF] transition-colors font-semibold"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
