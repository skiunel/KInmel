import { z } from 'zod';

// ─── Shipping Address ───

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(100),
  phone: z
    .string()
    .min(7, 'Phone number is required')
    .max(20)
    .regex(/^[+\d\s()-]+$/, 'Invalid phone number'),
  street: z.string().min(3, 'Street address is required').max(200),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State/Province is required').max(100),
  postalCode: z.string().min(3, 'Postal code is required').max(20),
  country: z.string().default('Nepal'),
});

// ─── Checkout (Place Order) ───

export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z
    .enum(['cod', 'esewa', 'khalti', 'bank_transfer', 'stripe'])
    .default('cod'),
  notes: z.string().max(500).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ─── Update Order Status (Admin) ───

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ]),
  message: z.string().min(1).max(200).optional(),
  location: z.string().max(100).optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

// ─── Cancel Order ───

export const cancelOrderSchema = z.object({
  reason: z.string().min(5, 'Please provide a reason').max(500),
});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

// ─── Query ───

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'total_asc', 'total_desc']).default('newest'),
});

export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
