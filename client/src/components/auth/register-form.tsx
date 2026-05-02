'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useRegister } from '@/hooks/use-auth-mutations';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { ROUTES } from '@/lib/constants';
import { GOOGLE_AUTH_ENABLED } from '@/lib/runtime-config';
import { cn } from '@/lib/utils';
import { GoogleLoginButton } from './google-login-button';

const pwRules = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
];

const inputCls = "h-11 w-full rounded-xl border border-[#e4e4e7] bg-white px-4 text-sm outline-none placeholder:text-[#a1a1aa] focus:border-[rgba(22,163,74,0.4)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.08)] transition-all";
const labelCls = "text-xs font-medium text-[#71717a]";

export function RegisterForm() {
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const reg = useRegister();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const pw = watch('password', '');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-extrabold tracking-tight text-[#18181B]">Create account</h2>
        <p className="mt-1.5 text-sm text-[#71717a]">Join the Kinmel community</p>
      </div>

      <GoogleLoginButton />

      {GOOGLE_AUTH_ENABLED && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#e4e4e7]" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-[#a1a1aa]">or continue with</span></div>
        </div>
      )}

      <form onSubmit={handleSubmit((d) => reg.mutate(d))} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={labelCls}>Full name</label>
          <input id="name" type="text" placeholder="John Doe" autoComplete="name" className={inputCls} {...register('name')} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelCls}>Email address</label>
          <input id="email" type="email" placeholder="you@example.com" autoComplete="email" className={inputCls} {...register('email')} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className={labelCls}>Phone (optional)</label>
          <input id="phone" type="tel" placeholder="+977 98XXXXXXXX" autoComplete="tel" className={inputCls} {...register('phone')} />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className={labelCls}>Password</label>
          <div className="relative">
            <input id="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" autoComplete="new-password" className={inputCls + " pr-10"} {...register('password')} />
            <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#71717a]">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {pw.length > 0 && (
            <div className="mt-1.5 grid grid-cols-2 gap-1">
              {pwRules.map(r => {
                const ok = r.test(pw);
                return (
                  <div key={r.label} className="flex items-center gap-1 text-[10px]">
                    {ok ? <Check className="h-3 w-3 text-emerald-500" /> : <X className="h-3 w-3 text-[#d4d4d8]" />}
                    <span className={ok ? 'text-emerald-600' : 'text-[#a1a1aa]'}>{r.label}</span>
                  </div>
                );
              })}
            </div>
          )}
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className={labelCls}>Confirm password</label>
          <div className="relative">
            <input id="confirmPassword" type={showCf ? 'text' : 'password'} placeholder="••••••••" autoComplete="new-password" className={inputCls + " pr-10"} {...register('confirmPassword')} />
            <button type="button" tabIndex={-1} onClick={() => setShowCf(!showCf)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#71717a]">
              {showCf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={reg.isPending} className="btn-primary w-full mt-1">
          {reg.isPending ? 'Creating...' : 'Create account'}
        </button>

        <p className="text-center text-sm text-[#71717a]">
          Already have an account? <Link href={ROUTES.login} className="text-[#16a34a] hover:underline font-medium">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
