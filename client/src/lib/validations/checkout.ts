import { z } from 'zod/v4';

export const shippingSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .min(7, 'Enter a valid phone number')
    .max(20)
    .regex(/^[+\d\s()-]+$/, 'Invalid phone number'),
  street: z
    .string()
    .min(1, 'Street address is required')
    .min(3, 'Enter a valid street address')
    .max(200),
  city: z
    .string()
    .min(1, 'City is required')
    .min(2, 'Enter a valid city')
    .max(100),
  state: z
    .string()
    .min(1, 'State/Province is required')
    .min(2, 'Enter a valid state')
    .max(100),
  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .min(3, 'Enter a valid postal code')
    .max(20),
  country: z.string().min(1),
});

export const checkoutSchema = z.object({
  shippingAddress: shippingSchema,
  paymentMethod: z.enum(['cod', 'esewa', 'khalti', 'bank_transfer', 'stripe']),
  notes: z.string().max(500).optional(),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
