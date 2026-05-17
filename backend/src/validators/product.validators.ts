import { z } from 'zod';
import { PAGINATION } from '../config/constants';

export const createProductSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must be at most 200 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be at most 5000 characters'),
  shortDescription: z
    .string()
    .max(300, 'Short description must be at most 300 characters')
    .optional()
    .default(''),
  price: z
    .number({ required_error: 'Price is required' })
    .positive('Price must be a positive number'),
  compareAtPrice: z
    .number()
    .positive('Compare-at price must be positive')
    .nullable()
    .optional(),
  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .max(10, 'Maximum 10 images allowed')
    .optional()
    .default([]),
  category: z
    .string({ required_error: 'Category is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  tags: z
    .array(z.string().trim().max(30))
    .max(15, 'Maximum 15 tags allowed')
    .optional()
    .default([]),
  sku: z
    .string({ required_error: 'SKU is required' })
    .trim()
    .min(2, 'SKU must be at least 2 characters')
    .max(30, 'SKU must be at most 30 characters'),
  stock: z
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .optional()
    .default(0),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION.MAX_LIMIT)
    .optional()
    .default(PAGINATION.DEFAULT_LIMIT),
  search: z.string().trim().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z
    .enum(['price_asc', 'price_desc', 'newest', 'oldest', 'rating', 'name_asc', 'name_desc'])
    .optional()
    .default('newest'),
  featured: z.enum(['true', 'false']).optional(),
  inStock: z.enum(['true', 'false']).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
