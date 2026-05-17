'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ImageIcon,
  Mail,
  Phone,
  ShieldCheck,
  User2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUpdateProfile } from '@/hooks/use-profile';
import type { User } from '@/types';
import { cn, formatDate, formatDateTime } from '@/lib/utils';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface ProfileStudioCardProps {
  user: User;
}

export function ProfileStudioCard({ user }: ProfileStudioCardProps) {
  const updateProfile = useUpdateProfile();
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone ?? '',
    avatar: user.avatar ?? '',
  });

  useEffect(() => {
    setForm({
      name: user.name,
      phone: user.phone ?? '',
      avatar: user.avatar ?? '',
    });
  }, [user.avatar, user.name, user.phone]);

  const normalized = useMemo(
    () => ({
      name: form.name.trim(),
      phone: form.phone.trim(),
      avatar: form.avatar.trim(),
    }),
    [form]
  );

  const completion = Math.round(
    ([normalized.name, user.email, normalized.phone, normalized.avatar].filter(Boolean)
      .length /
      4) *
      100
  );
  const hasChanges =
    normalized.name !== user.name ||
    normalized.phone !== (user.phone ?? '') ||
    normalized.avatar !== (user.avatar ?? '');
  const canSave = normalized.name.length >= 2 && hasChanges && !updateProfile.isPending;

  const previewName = normalized.name || user.name;
  const profileChecklist = [
    {
      label: 'Full name on file',
      complete: Boolean(normalized.name),
    },
    {
      label: 'Phone number available',
      complete: Boolean(normalized.phone),
    },
    {
      label: 'Profile photo added',
      complete: Boolean(normalized.avatar),
    },
  ];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    updateProfile.mutate({
      name: normalized.name,
      phone: normalized.phone || null,
      avatar: normalized.avatar || null,
    });
  }

  return (
    <Card
      id="profile-studio"
      className="rounded-[2rem] border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">Profile details</h3>
          <p className="text-sm text-slate-500">
            Manage the identity and contact details attached to your account,
            deliveries, and future review attribution.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip variant="success">Secure account record</Chip>
          <Chip variant="verified">Completion {completion}%</Chip>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-18 border border-white shadow-sm" size="lg">
              {normalized.avatar ? (
                <AvatarImage src={normalized.avatar} alt={previewName} />
              ) : null}
              <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                {getInitials(previewName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold text-slate-950">
                {previewName}
              </p>
              <p className="truncate text-sm text-slate-500">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip variant="success">
                  <ShieldCheck className="size-3" />
                  Active account
                </Chip>
                <Chip variant="default">
                  {user.role === 'admin' ? 'Admin access linked' : 'Customer account'}
                </Chip>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {[
              {
                label: 'Email',
                value: user.email,
                detail: 'Primary sign-in address',
                icon: Mail,
              },
              {
                label: 'Member since',
                value: formatDate(user.createdAt),
                detail: 'Account creation date',
                icon: CheckCircle2,
              },
              {
                label: 'Last session',
                value: user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Recent activity unavailable',
                detail: 'Most recent authenticated access',
                icon: ShieldCheck,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.4rem] border border-slate-200 bg-white/90 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <item.icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-950">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[1.4rem] border border-slate-200 bg-white/90 p-4">
            <p className="text-sm font-medium text-slate-950">Profile completion</p>
            <div className="mt-3 space-y-2.5">
              {profileChecklist.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 text-sm font-medium',
                      item.complete ? 'text-emerald-700' : 'text-slate-500'
                    )}
                  >
                    <CheckCircle2 className="size-4" />
                    {item.complete ? 'Complete' : 'Optional'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Editable Information
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Update the customer-facing details that appear throughout your account.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="profile-name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Full name
              </label>
              <div className="relative">
                <User2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="profile-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-10"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-phone"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Phone number
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="profile-phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-10"
                  placeholder="+977 98XXXXXXXX"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Used for delivery coordination and support communication.
              </p>
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="profile-email"
                  value={user.email}
                  className="h-11 rounded-2xl border-slate-200 bg-slate-100 pl-10 text-slate-500"
                  disabled
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                This address remains tied to your sign-in credentials.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="profile-avatar"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Profile photo URL
              </label>
              <div className="relative">
                <ImageIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="profile-avatar"
                  value={form.avatar}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, avatar: event.target.value }))
                  }
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-10"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Optional. A professional photo helps your account feel complete and
                recognizable.
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-950">
                  Update impact
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Changes apply across your account summary, delivery contact details,
                  and future review attribution.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-slate-600">
                <ShieldCheck className="size-3.5" />
                Protected update
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p
              className={cn(
                'text-sm',
                normalized.name.length < 2 ? 'text-amber-700' : 'text-slate-500'
              )}
            >
              {normalized.name.length < 2
                ? 'Full name must be at least 2 characters.'
                : hasChanges
                  ? 'Pending changes are ready to save.'
                  : 'Your profile details are current.'}
            </p>

            <Button type="submit" size="lg" className="h-11 px-5" disabled={!canSave}>
              {updateProfile.isPending ? 'Saving changes...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
