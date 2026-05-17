'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, ArrowRight, Lock } from 'lucide-react';
import { useLogin } from '@/hooks/use-auth-mutations';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';

const inputCls =
  'h-12 w-full border border-[#0A0A0A]/15 bg-white px-4 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/35 outline-none transition-colors focus:border-[#0A0A0A]';
const labelCls =
  'font-mono text-[10px] font-semibold text-[#0A0A0A]/55 uppercase tracking-[0.22em]';

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex min-h-screen bg-[#F4F4F4]">
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-[420px]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/55 hover:text-[#E63946] transition-colors mb-10"
          >
            ← Back to store
          </Link>

          <div className="mb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#E63946] mb-3">
              ◆ Admin Portal
            </p>
            <h1 className="font-sans text-3xl font-black uppercase tracking-[-0.03em] text-[#0A0A0A]">
              Restricted access.
            </h1>
            <p className="mt-2 text-sm text-[#0A0A0A]/55">
              Authorized personnel only.
            </p>
          </div>

          <div className="bg-white border border-[#0A0A0A]/10 p-7">
            <form
              onSubmit={handleSubmit((d) => login.mutate(d))}
              className="space-y-4"
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="admin-email" className={labelCls}>
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@kinmel.com"
                  autoComplete="email"
                  className={inputCls}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#E63946]">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="admin-password" className={labelCls}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`${inputCls} pr-10`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A0A0A]/40 hover:text-[#0A0A0A] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#E63946]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={login.isPending}
                className="group flex h-12 w-full items-center justify-center gap-2 bg-[#0A0A0A] font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white hover:bg-[#E63946] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {login.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Access dashboard
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#0A0A0A]/10">
              <p className="text-center text-sm text-[#0A0A0A]/55">
                Not an admin?{' '}
                <Link
                  href="/login"
                  className="text-[#E63946] hover:text-[#0A0A0A] transition-colors font-semibold"
                >
                  Customer login
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/30">
            Kinmel® · Internal use
          </p>
        </div>
      </div>
    </div>
  );
}
