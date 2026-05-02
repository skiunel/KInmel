'use client';

import { Banknote, Smartphone, Building2, Check, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const PAYMENT_METHODS = [
  {
    id: 'cod' as const,
    label: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: Banknote,
    available: true,
    badge: null,
  },
  {
    id: 'esewa' as const,
    label: 'eSewa',
    description: 'Pay securely with eSewa digital wallet',
    icon: Wallet,
    available: true,
    badge: 'Popular',
  },
  {
    id: 'khalti' as const,
    label: 'Khalti',
    description: 'Pay with Khalti wallet',
    icon: Smartphone,
    available: true,
    badge: null,
  },
  {
    id: 'bank_transfer' as const,
    label: 'Bank Transfer',
    description: 'Direct bank transfer (manual verification)',
    icon: Building2,
    available: false,
    badge: 'Coming soon',
  },
];

interface PaymentMethodProps {
  selected: string;
  onChange: (method: 'cod' | 'esewa' | 'khalti' | 'bank_transfer') => void;
}

export function PaymentMethod({ selected, onChange }: PaymentMethodProps) {
  return (
    <div className="space-y-6">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-slate-900 text-sm font-semibold text-white">
          2
        </div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">Payment method</h2>
      </div>

      <div className="space-y-3">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const isSelected = selected === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => method.available && onChange(method.id)}
              disabled={!method.available}
              className={cn(
                'relative flex w-full items-center gap-4 rounded-[1.5rem] border p-4 text-left transition-all',
                isSelected
                  ? 'border-slate-900 bg-white ring-1 ring-slate-900/10'
                  : method.available
                    ? 'border-black/8 bg-white/84 hover:bg-white'
                    : 'border-black/8 bg-white/50 opacity-60 cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                )}
              >
                <Icon className="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{method.label}</p>
                  {method.badge && (
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-medium',
                      method.available
                        ? 'bg-[#e4ebf8] text-[#546989]'
                        : 'bg-slate-100 text-slate-500'
                    )}>
                      {method.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{method.description}</p>
              </div>

              {/* Selection indicator */}
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                  isSelected
                    ? 'border-slate-900 bg-slate-900'
                    : 'border-slate-300'
                )}
              >
                {isSelected && <Check className="size-3 text-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
