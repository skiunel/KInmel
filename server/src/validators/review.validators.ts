import { z } from 'zod';

// ─── Create Review ───

export const createReviewSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1, 'Rating must be 1–5').max(5, 'Rating must be 1–5'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  content: z.string().min(10, 'Review must be at least 10 characters').max(2000),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ─── Product Reviews Query ───

export const reviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort: z.enum(['newest', 'oldest', 'highest', 'lowest']).default('newest'),
});

export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>;

// ─── Admin: Flag / Unflag ───

export const flagReviewSchema = z.object({
  isFlagged: z.boolean(),
  flagReason: z.string().max(300).optional(),
});

export type FlagReviewInput = z.infer<typeof flagReviewSchema>;
