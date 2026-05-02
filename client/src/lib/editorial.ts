import type { Product } from '@/types';

export const FASHION_IMAGE_AI_PROMPT =
  'fashion website UI, editorial layout, split screen design, bold typography, red script text overlay, black and white contrast, modern streetwear UI, dribbble style, figma design';

export const EDITORIAL_FALLBACK_IMAGES = [
  '/editorial-model-a.svg',
  '/editorial-model-b.svg',
  '/editorial-model-c.svg',
] as const;

export function getEditorialImage(
  product: Pick<Product, 'images'> | null | undefined,
  index = 0
) {
  const source = product?.images?.[0];
  if (source) {
    return source;
  }

  return EDITORIAL_FALLBACK_IMAGES[index % EDITORIAL_FALLBACK_IMAGES.length];
}
