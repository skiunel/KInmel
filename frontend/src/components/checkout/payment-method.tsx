'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export type PaymentMethodId = 'stripe' | 'esewa' | 'khalti' | 'cod' | 'bank_transfer';

interface PaymentMethodProps {
  selected: string;
  onChange: (method: PaymentMethodId) => void;
}

const METHODS: { id: PaymentMethodId; icon: string; label: string; available: boolean }[] = [
  { id: 'stripe', icon: '💳', label: 'Card (Stripe)', available: true },
  { id: 'khalti', icon: '🟣', label: 'Khalti', available: true },
  { id: 'cod', icon: '💵', label: 'Cash on Delivery', available: true },
];

export function PaymentMethod({ selected, onChange }: PaymentMethodProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#E63946] mb-2">
          ◆ Step 02
        </p>
        <h2 className="font-sans text-2xl md:text-3xl font-black uppercase tracking-[-0.02em] text-[#0A0A0A]">Payment method</h2>
      </div>

      {/* Pill selector */}
      <div className="flex flex-wrap gap-2">
        {METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            disabled={!m.available}
            className={cn(
              'px-5 h-11 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors inline-flex items-center gap-2',
              selected === m.id
                ? 'bg-[#0A0A0A] text-white border border-[#0A0A0A]'
                : 'bg-white text-[#0A0A0A] border border-[#0A0A0A]/15 hover:bg-[#0A0A0A] hover:text-white',
              !m.available && 'opacity-40 cursor-not-allowed'
            )}
          >
            <span className="text-base">{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* Method-specific UI */}
      {selected === 'esewa' && <EsewaBlock />}
      {selected === 'khalti' && <KhaltiBlock />}
      {selected === 'cod' && <CashOnDeliveryBlock />}
    </div>
  );
}

function KhaltiBlock() {
  return (
    <div className="rounded-none border border-[#0A0A0A]/10 bg-[#EDE7DA]/[0.03] p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="size-10 rounded-none bg-[#5C2D91] text-[#0A0A0A] flex items-center justify-center text-lg">🟣</div>
        <div>
          <p className="font-heading text-base font-bold text-[#0A0A0A]">Pay with Khalti</p>
          <p className="text-xs text-[#0A0A0A]/55">Redirects to Khalti for secure payment.</p>
        </div>
      </div>
      <p className="text-[11px] font-mono uppercase tracking-widest text-[#0A0A0A]/40">
        ◆ Continue to Khalti after placing order
      </p>
    </div>
  );
}

function StripeCardPreview() {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [flipped, setFlipped] = useState(false);

  const formattedNumber = cardNumber
    .replace(/\s/g, '')
    .replace(/(\d{4})/g, '$1 ')
    .trim()
    .slice(0, 19);

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* 3D animated card preview */}
      <div className="perspective-1000" style={{ perspective: '1000px' }}>
        <div
          className="relative w-full max-w-sm mx-auto h-56 transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-none p-6 flex flex-col justify-between"
            style={{
              background:
                'linear-gradient(135deg, #E63946 0%, #E63946 50%, #E63946 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 6s ease infinite',
              backfaceVisibility: 'hidden',
              boxShadow: '0 20px 60px rgba(108, 99, 255, 0.4)',
            }}
          >
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs uppercase tracking-widest text-[#0A0A0A]/80">
                Kinmel
              </span>
              <span className="text-[#0A0A0A] text-xl font-bold italic">VISA</span>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#0A0A0A]/70 mb-1">
                Card Number
              </p>
              <p className="font-mono text-lg text-[#0A0A0A] tracking-wider">
                {formattedNumber || '•••• •••• •••• ••••'}
              </p>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A]/70">
                  Cardholder
                </p>
                <p className="text-sm text-[#0A0A0A] font-semibold mt-1">
                  {name || 'YOUR NAME'}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A]/70">
                  Expires
                </p>
                <p className="text-sm text-[#0A0A0A] font-semibold mt-1">
                  {expiry || 'MM/YY'}
                </p>
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-none flex flex-col justify-center"
            style={{
              background:
                'linear-gradient(135deg, #1a1a2e 0%, #E63946 100%)',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              boxShadow: '0 20px 60px rgba(108, 99, 255, 0.4)',
            }}
          >
            <div className="h-12 bg-black/70 mt-6" />
            <div className="px-6 mt-6">
              <div className="bg-white/90 h-10 rounded flex items-center justify-end pr-3">
                <span className="font-mono text-sm text-black">{cvc || 'CVC'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-[#0A0A0A]/60 mb-2 block">
            Card Number
          </label>
          <input
            value={formattedNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
            placeholder="1234 5678 9012 3456"
            className="glass-input w-full font-mono tracking-wider"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-[#0A0A0A]/60 mb-2 block">
            Cardholder Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            placeholder="JOHN DOE"
            className="glass-input w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-[#0A0A0A]/60 mb-2 block">
              Expiry
            </label>
            <input
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/YY"
              className="glass-input w-full font-mono"
              maxLength={5}
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-[#0A0A0A]/60 mb-2 block">
              CVC
            </label>
            <input
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onFocus={() => setFlipped(true)}
              onBlur={() => setFlipped(false)}
              placeholder="123"
              className="glass-input w-full font-mono"
              inputMode="numeric"
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-[#0A0A0A]/40">
        Test mode: this preview is for display only. Real cards processed by Stripe on submit.
      </p>
    </div>
  );
}

function EsewaBlock() {
  return (
    <div
      className="border border-[#0A0A0A]/10 bg-white p-6 border-[#60BB46]/30"
      style={{
        background: 'linear-gradient(135deg, rgba(96,187,70,0.1), rgba(96,187,70,0.05))',
      }}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">🟢</div>
        <div>
          <h3 className="font-heading text-xl font-black text-[#0A0A0A]">eSewa Wallet</h3>
          <p className="mt-2 text-sm text-[#0A0A0A]/70">
            You will be redirected to eSewa to complete your payment securely. After
            successful payment, you&apos;ll come back here.
          </p>
        </div>
      </div>
    </div>
  );
}

function CashOnDeliveryBlock() {
  return (
    <div className="border border-[#0A0A0A]/10 bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="text-4xl">💵</div>
        <div>
          <h3 className="font-heading text-xl font-black text-[#0A0A0A]">Cash on Delivery</h3>
          <p className="mt-2 text-sm text-[#0A0A0A]/70">
            Pay in cash when your order arrives. Available for in-country deliveries only.
          </p>
        </div>
      </div>
    </div>
  );
}
