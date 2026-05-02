import { z } from 'zod';
import { CART } from '../config/constants';

export const addToCartSchema = z.object({
  productId: z
    .string({ required_error: 'Product ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(CART.MAX_QUANTITY_PER_ITEM, `Maximum ${CART.MAX_QUANTITY_PER_ITEM} per item`),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(CART.MAX_QUANTITY_PER_ITEM, `Maximum ${CART.MAX_QUANTITY_PER_ITEM} per item`),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
