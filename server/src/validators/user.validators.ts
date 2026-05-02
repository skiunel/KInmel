import { z } from 'zod';

const phoneRegex = /^\+?[\d\s-]{7,15}$/;

const nullableTrimmedString = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  });

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters')
      .optional(),
    phone: nullableTrimmedString.refine(
      (value) => value === undefined || value === null || phoneRegex.test(value),
      'Invalid phone format'
    ),
    avatar: nullableTrimmedString.refine(
      (value) => value === undefined || value === null || z.string().url().safeParse(value).success,
      'Avatar must be a valid URL'
    ),
  })
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    {
      message: 'At least one profile field is required',
    }
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
