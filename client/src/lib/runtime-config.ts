export const GOOGLE_AUTH_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || '';

export const GOOGLE_AUTH_ENABLED = GOOGLE_AUTH_CLIENT_ID.length > 0;
