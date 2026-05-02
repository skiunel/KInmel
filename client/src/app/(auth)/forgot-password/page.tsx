'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Mail, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/form-field';
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
      showToast.success('Password reset instructions generated.');
    } catch (error) {
      showToast.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading">
        Reset password
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your email and we&apos;ll generate a reset link for your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <FormField label="Email" htmlFor="reset-email" error={errors.email?.message} required>
          <Input
            id="reset-email"
            type="email"
            placeholder="you@example.com"
            className="h-10"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <Button
          type="submit"
          size="lg"
          className="w-full h-11 text-sm font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating reset link...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Send reset link
            </>
          )}
        </Button>
      </form>

      {submittedEmail ? (
        <div className="mt-6 space-y-3 rounded-xl border bg-muted/40 p-4">
          <p className="text-sm text-foreground">
            If an account exists for <span className="font-semibold">{submittedEmail}</span>,
            reset instructions have been generated.
          </p>

          {preview?.previewUrl ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Development preview link:
              </p>
              <div className="rounded-lg border bg-background p-3">
                <code className="break-all text-xs text-foreground">
                  {preview.previewUrl}
                </code>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(preview.previewUrl!);
                    showToast.success('Reset link copied.');
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy link
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => window.location.assign(preview.previewUrl!)}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open reset page
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No preview link is exposed in production mode.
            </p>
          )}
        </div>
      ) : null}

      <div className="mt-6 text-center">
        <Link
          href={ROUTES.login}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
