'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Mail, Copy, ExternalLink } from 'lucide-react';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/validations/auth';
import { ROUTES } from '@/lib/constants';
import { authService, type PreviewLink } from '@/services/auth.service';
import { showToast } from '@/lib/toast';

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewLink | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      const result = await authService.forgotPassword(data);
      setSubmittedEmail(data.email);
      setPreview(result.passwordReset);
      showToast.success('Reset link generated.');
    } catch (error) {
      showToast.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[420px]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/55 hover:text-[#E63946] transition-colors mb-10"
        >
          ← Back
        </Link>

        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#E63946] mb-3">
            ◆ Reset
          </p>
          <h1 className="font-sans text-3xl font-black uppercase tracking-[-0.03em] text-[#0A0A0A]">
            Forgot password.
          </h1>
          <p className="mt-2 text-sm text-[#0A0A0A]/55">
            Enter your email — we&apos;ll generate a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reset-email" className="font-mono text-[10px] font-semibold text-[#0A0A0A]/55 uppercase tracking-[0.22em]">
              Email
            </label>
            <input
              id="reset-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="h-12 w-full border border-[#0A0A0A]/15 bg-white px-4 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/35 outline-none transition-colors focus:border-[#0A0A0A]"
              {...register('email')}
            />
            {errors.email && (
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#E63946]">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex h-12 w-full items-center justify-center gap-2 bg-[#0A0A0A] font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white hover:bg-[#E63946] transition-colors disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" /> Send reset link
              </>
            )}
          </button>
        </form>

        {submittedEmail && (
          <div className="mt-6 space-y-3 border border-[#0A0A0A]/10 bg-[#F4F4F4] p-5">
            <p className="text-sm text-[#0A0A0A]">
              Reset link for <span className="font-semibold">{submittedEmail}</span>:
            </p>

            {preview?.previewUrl ? (
              <div className="space-y-3">
                <div className="border border-[#0A0A0A]/15 bg-white p-3 break-all">
                  <code className="text-xs text-[#0A0A0A] font-mono">{preview.previewUrl}</code>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(preview.previewUrl!);
                      showToast.success('Link copied.');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 h-9 border border-[#0A0A0A]/15 bg-white font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-colors"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.assign(preview.previewUrl!)}
                    className="inline-flex items-center gap-1.5 px-3 h-9 bg-[#0A0A0A] font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:bg-[#E63946] transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" /> Open
                  </button>
                </div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#0A0A0A]/45">
                  ◆ Email service not configured. Link shown directly.
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#0A0A0A]/55">
                If an account exists, instructions have been sent.
              </p>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href={ROUTES.login}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#E63946] hover:text-[#0A0A0A] transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
