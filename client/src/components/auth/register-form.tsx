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
  'h-12 w-full border border-[#0A0A0A]/15 bg-white px-4 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/35 outline-none transition-colors focus:border-[#0A0A0A] pr-10';
const labelCls = 'font-mono text-[10px] font-semibold text-[#0A0A0A]/55 uppercase tracking-[0.22em]';

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
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#E63946] mb-3">◆ Sign up</p>
        <h2 className="font-sans text-3xl font-black uppercase tracking-[-0.03em] text-[#0A0A0A]">
          Create account.
        </h2>
        <p className="mt-2 text-sm text-[#0A0A0A]/55">Join the Kinmel community.</p>
      </div>

      <form onSubmit={handleSubmit((d) => reg.mutate(d))} className="space-y-3.5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={labelCls}>Full name</label>
          <input id="name" type="text" placeholder="John Doe" autoComplete="name" className={inputCls} {...register('name')} />
          {errors.name && <p className="font-mono text-[10px] uppercase tracking-widest text-[#E63946]">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelCls}>Email</label>
          <input id="email" type="email" placeholder="you@example.com" autoComplete="email" className={inputCls} {...register('email')} />
          {errors.email && <p className="font-mono text-[10px] uppercase tracking-widest text-[#E63946]">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className={labelCls}>Phone (optional)</label>
          <input id="phone" type="tel" placeholder="+977 98XXXXXXXX" autoComplete="tel" className={inputCls} {...register('phone')} />
          {errors.phone && <p className="font-mono text-[10px] uppercase tracking-widest text-[#E63946]">{errors.phone.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className={labelCls}>Password</label>
          <div className="relative">
            <input id="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" autoComplete="new-password" className={inputCls} {...register('password')} />
            <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A0A0A]/40 hover:text-[#0A0A0A] transition-colors">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {pw.length > 0 && (
            <div className="mt-1 grid grid-cols-2 gap-1">
              {pwRules.map((r) => {
                const ok = r.test(pw);
                return (
                  <div key={r.label} className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em]">
                    {ok ? <Check className="h-3 w-3 text-[#0A0A0A]" /> : <X className="h-3 w-3 text-[#0A0A0A]/30" />}
                    <span className={ok ? 'text-[#0A0A0A]' : 'text-[#0A0A0A]/40'}>{r.label}</span>
                  </div>
                );
              })}
            </div>
          )}
          {errors.password && <p className="font-mono text-[10px] uppercase tracking-widest text-[#E63946]">{errors.password.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className={labelCls}>Confirm password</label>
          <div className="relative">
            <input id="confirmPassword" type={showCf ? 'text' : 'password'} placeholder="••••••••" autoComplete="new-password" className={inputCls} {...register('confirmPassword')} />
            <button type="button" tabIndex={-1} onClick={() => setShowCf(!showCf)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A0A0A]/40 hover:text-[#0A0A0A] transition-colors">
              {showCf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="font-mono text-[10px] uppercase tracking-widest text-[#E63946]">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={reg.isPending}
          className="group flex h-12 w-full items-center justify-center gap-2 bg-[#0A0A0A] font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white hover:bg-[#E63946] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {reg.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              Create account
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
        Already have an account?{' '}
        <Link
          href={ROUTES.login}
          className="text-[#E63946] hover:text-[#0A0A0A] transition-colors font-semibold"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
