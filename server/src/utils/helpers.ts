import crypto from 'crypto';

/**
 * Generate a unique order number: KNM-YYYYMMDD-XXXXX
 */
export const generateOrderNumber = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
  return `KNM-${date}-${random}`;
};

/**
 * Generate a URL-safe slug from a string.
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Pick only the specified keys from an object.
 */
export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
};

/**
 * Build a MongoDB pagination query from page + limit.
 */
export const getPagination = (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};
