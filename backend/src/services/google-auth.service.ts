import { env } from '../config/env';
import { ApiError } from '../utils/api-error';

interface GoogleProfile {
  email: string;
  name: string;
  googleId: string;
  avatar: string | null;
}

interface GoogleTokenInfo {
  aud?: string;
  email?: string;
  email_verified?: string;
  name?: string;
  picture?: string;
  sub?: string;
}

export async function verifyGoogleToken(idToken: string): Promise<GoogleProfile> {
  if (!env.GOOGLE_CLIENT_ID?.trim()) {
    throw ApiError.unavailable(
      'Google sign-in is not configured on the server. Set GOOGLE_CLIENT_ID first.'
    );
  }

  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );

    if (!response.ok) {
      throw ApiError.unauthorized('Invalid Google token');
    }

    const data = (await response.json()) as GoogleTokenInfo;

    // Verify the token is for our app
    if (data.aud !== env.GOOGLE_CLIENT_ID) {
      throw ApiError.unauthorized('Google token audience mismatch');
    }

    if (data.email_verified !== 'true' || !data.email || !data.sub) {
      throw ApiError.unauthorized('Google email not verified');
    }

    return {
      email: data.email,
      name: data.name || data.email.split('@')[0],
      googleId: data.sub,
      avatar: data.picture || null,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.unauthorized('Failed to verify Google token');
  }
}
