'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, ArrowRight } from 'lucide-react';
import {
  shippingSchema,
  type ShippingFormData,
} from '@/lib/validations/checkout';
import { cn } from '@/lib/utils';

interface ShippingFormProps {
  defaultValues?: Partial<ShippingFormData>;
  onSubmit: (data: ShippingFormData) => void;
}

const NEPAL_PROVINCES = [
  'Koshi',
  'Madhesh',
  'Bagmati',
  'Gandaki',
  'Lumbini',
  'Karnali',
  'Sudurpashchim',
];

const labelCls = 'font-mono text-xs uppercase tracking-widest text-white/60 mb-2 block';

export function ShippingForm({ defaultValues, onSubmit }: ShippingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Nepal',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-[#6C63FF] mb-2">
          Step 1
        </p>
        <h2 className="font-heading text-3xl font-black text-white">Shipping Address</h2>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Full Name"
            error={errors.fullName?.message}
            id="fullName"
            placeholder="Samir Dangol"
            register={register('fullName')}
          />
          <Field
            label="Phone Number"
            error={errors.phone?.message}
            id="phone"
            placeholder="+977 98XXXXXXXX"
            register={register('phone')}
          />
        </div>

        <Field
          label="Street Address"
          error={errors.street?.message}
          id="street"
          placeholder="123 Durbar Marg"
          register={register('street')}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field
            label="City"
            error={errors.city?.message}
            id="city"
            placeholder="Kathmandu"
            register={register('city')}
          />

          <div>
            <label htmlFor="state" className={labelCls}>
              Province <span className="text-[#FF6B6B]">*</span>
            </label>
            <select
              id="state"
              {...register('state')}
              className={cn(
                'glass-input w-full appearance-none cursor-pointer',
                errors.state && 'border-[#FF6B6B]/60'
              )}
            >
              <option value="" className="bg-[#07070F]">
                Select province
              </option>
              {NEPAL_PROVINCES.map((p) => (
                <option key={p} value={p} className="bg-[#07070F]">
                  {p}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 text-xs text-[#FF6B6B]">{errors.state.message}</p>
            )}
          </div>

          <Field
            label="Postal Code"
            error={errors.postalCode?.message}
            id="postalCode"
            placeholder="44600"
            register={register('postalCode')}
          />
        </div>

        <div>
          <label htmlFor="country" className={labelCls}>
            Country
          </label>
          <input
            id="country"
            value="Nepal"
            disabled
            className="glass-input w-full opacity-50 cursor-not-allowed"
          />
        </div>

        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-xs text-white/60">
          <MapPin className="size-4 shrink-0 text-[#00F5FF]" />
          <span>We currently deliver within Nepal only.</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary group">
          Continue to Payment
          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  id,
  placeholder,
  register,
  required = true,
}: {
  label: string;
  error?: string;
  id: string;
  placeholder: string;
  register: ReturnType<ReturnType<typeof useForm<ShippingFormData>>['register']>;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label} {required && <span className="text-[#FF6B6B]">*</span>}
      </label>
      <input
        id={id}
        placeholder={placeholder}
        className={cn('glass-input w-full', error && 'border-[#FF6B6B]/60')}
        {...register}
      />
      {error && <p className="mt-1 text-xs text-[#FF6B6B]">{error}</p>}
    </div>
  );
}
