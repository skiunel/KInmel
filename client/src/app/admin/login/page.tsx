'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, ShieldAlert, Loader2, ArrowRight, Lock } from 'lucide-react';
import { useLogin } from '@/hooks/use-auth-mutations';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';

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
    <div className="flex min-h-screen bg-[#09090B]">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FF6B6B]/5 rounded-full blur-[120px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-[400px]">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/65 transition-colors mb-10 font-mono uppercase tracking-widest"
          >
            ← Back to store
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/20">
                <ShieldAlert className="size-6 text-[#FF6B6B]" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-black text-white tracking-tight">
                  Admin Portal
                </h1>
                <p className="text-xs text-white/40 font-mono">Kinmel management access</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[#FF6B6B]/15 bg-[#FF6B6B]/5 px-4 py-3">
              <Lock className="size-3.5 text-[#FF6B6B] shrink-0" />
              <p className="text-xs text-[#EF4444]">
                Restricted access — authorized personnel only
              </p>
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#111113] p-7 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <form onSubmit={handleSubmit((d) => login.mutate(d))} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="admin-email"
                  className="text-xs font-medium text-white/65 uppercase tracking-widest"
                >
                  Email address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@kinmel.com"
                  autoComplete="email"
                  className="h-12 w-full rounded-xl border border-[rgba(255,255,255,0.1)] bg-white/[0.04] px-4 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-[#FF6B6B]/50 focus:shadow-[0_0_0_3px_rgba(255,107,107,0.1)]"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-[#EF4444]">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="admin-password"
                  className="text-xs font-medium text-white/65 uppercase tracking-widest"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-[rgba(255,255,255,0.1)] bg-white/[0.04] px-4 pr-10 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-[#FF6B6B]/50 focus:shadow-[0_0_0_3px_rgba(255,107,107,0.1)]"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/65 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-[#EF4444]">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={login.isPending}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B6B] text-sm font-bold text-white transition-all hover:bg-[#B91C1C] shadow-[0_4px_24px_rgba(255,107,107,0.3)] hover:shadow-[0_4px_32px_rgba(255,107,107,0.45)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
              >
                {login.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4" />
                    Access dashboard
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#1F1F23]">
              <p className="text-center text-sm text-white/40">
                Not an admin?{' '}
                <Link
                  href="/login"
                  className="text-[#E63946] hover:text-[#E63946] transition-colors font-semibold"
                >
                  Customer login
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-[rgba(255,255,255,0.1)] font-mono">
            Kinmel · Secured by blockchain verification
          </p>
        </div>
      </div>
    </div>
  );
}
