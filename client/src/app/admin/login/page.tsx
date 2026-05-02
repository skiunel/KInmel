'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Shield, Loader2 } from 'lucide-react';
import { useLogin } from '@/hooks/use-auth-mutations';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';

const inputCls = "h-11 w-full rounded-xl border border-[#e4e4e7] bg-white px-4 text-sm outline-none placeholder:text-[#a1a1aa] focus:border-[rgba(22,163,74,0.4)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.08)] transition-all";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#22c55e]">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#18181B]">Admin portal</h1>
          <p className="mt-1 text-sm text-[#71717a]">Kinmel management dashboard</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit((d) => login.mutate(d))} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-email" className="text-xs font-medium text-[#71717a]">Email address</label>
              <input id="admin-email" type="email" placeholder="admin@kinmel.com" autoComplete="email" className={inputCls} {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-password" className="text-xs font-medium text-[#71717a]">Password</label>
              <div className="relative">
                <input id="admin-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password" className={inputCls + " pr-10"} {...register('password')} />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#71717a] transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={login.isPending} className="btn-primary w-full gap-2 mt-2">
              {login.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Authenticating...</>
              ) : (
                <><Shield className="h-4 w-4" /> Sign in to dashboard</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#e4e4e7]">
            <p className="text-center text-sm text-[#71717a]">
              Not an admin?{' '}
              <Link href="/login" className="text-[#16a34a] hover:underline font-medium">Customer login</Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#a1a1aa]">Secured with blockchain verification</p>
      </div>
    </div>
  );
}
