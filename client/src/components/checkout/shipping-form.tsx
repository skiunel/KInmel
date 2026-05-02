'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/form-field';
import {
  shippingSchema,
  type ShippingFormData,
} from '@/lib/validations/checkout';

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
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-slate-900 text-sm font-semibold text-white">
          1
        </div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">Shipping address</h2>
      </div>

      <div className="storefront-card space-y-4">
        {/* Name + Phone */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Full Name" htmlFor="fullName" error={errors.fullName?.message} required>
            <Input
              id="fullName"
              placeholder="Samir Dangol"
              {...register('fullName')}
              className={errors.fullName ? 'storefront-input border-destructive' : 'storefront-input'}
            />
          </FormField>

          <FormField label="Phone Number" htmlFor="phone" error={errors.phone?.message} required>
            <Input
              id="phone"
              placeholder="+977 98XXXXXXXX"
              {...register('phone')}
              className={errors.phone ? 'storefront-input border-destructive' : 'storefront-input'}
            />
          </FormField>
        </div>

        {/* Street */}
        <FormField label="Street Address" htmlFor="street" error={errors.street?.message} required>
          <Input
            id="street"
            placeholder="123 Durbar Marg"
            {...register('street')}
            className={errors.street ? 'storefront-input border-destructive' : 'storefront-input'}
          />
        </FormField>

        {/* City + State + Postal */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="City" htmlFor="city" error={errors.city?.message} required>
            <Input
              id="city"
              placeholder="Kathmandu"
              {...register('city')}
              className={errors.city ? 'storefront-input border-destructive' : 'storefront-input'}
            />
          </FormField>

          <FormField label="Province" htmlFor="state" error={errors.state?.message} required>
            <select
              id="state"
              {...register('state')}
              className={`flex h-11 w-full rounded-[1.2rem] border bg-white/88 px-4 py-2 text-sm text-slate-900 shadow-[0_12px_30px_rgba(43,33,23,0.06)] transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${
                errors.state ? 'border-destructive' : 'border-black/8'
              }`}
            >
              <option value="">Select province</option>
              {NEPAL_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Postal Code" htmlFor="postalCode" error={errors.postalCode?.message} required>
            <Input
              id="postalCode"
              placeholder="44600"
              {...register('postalCode')}
              className={errors.postalCode ? 'storefront-input border-destructive' : 'storefront-input'}
            />
          </FormField>
        </div>

        {/* Country (disabled) */}
        <FormField label="Country" htmlFor="country">
          <Input
            id="country"
            value="Nepal"
            disabled
            className="storefront-input bg-slate-100 text-slate-500"
          />
        </FormField>

        <div className="flex items-center gap-2 rounded-[1.2rem] border border-black/8 bg-white/76 px-4 py-3 text-xs text-slate-600">
          <MapPin className="size-4 shrink-0 text-[#7c8fb5]" />
          <span>We currently deliver within Nepal only.</span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          className="storefront-button-primary min-w-[200px] border-transparent text-white"
        >
          Continue to Payment
        </Button>
      </div>
    </form>
  );
}
