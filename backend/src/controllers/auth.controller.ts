import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/async-handler';
import { env } from '../config/env';

// ─── Cookie Config ───

const REFRESH_COOKIE_NAME = 'kinmel_refresh';

// Vercel proxies /api/* to Render → browser sees same-origin → 'lax' is enough + safer.
// 'none' still works as fallback if someone hits Render directly.
const isProd = env.NODE_ENV === 'production';
const COOKIE_SAMESITE = (process.env.COOKIE_SAMESITE as 'lax' | 'none' | 'strict') || 'lax';

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: COOKIE_SAMESITE,
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions);
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: COOKIE_SAMESITE,
    path: '/api/v1/auth',
  });
};

// ─── POST /auth/register ───

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);

  setRefreshCookie(res, result.refreshToken);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      emailVerification: result.emailVerification,
    },
  });
});

// ─── POST /auth/login ───

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  setRefreshCookie(res, result.refreshToken);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

// ─── POST /auth/google ───

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({ success: false, message: 'idToken is required' });
    return;
  }

  const result = await authService.googleLogin(idToken);

  setRefreshCookie(res, result.refreshToken);

  res.status(200).json({
    success: true,
    message: 'Google login successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

// ─── POST /auth/verify-email ───

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyEmail(req.body);

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      user: result.user,
    },
  });
});

// ─── POST /auth/forgot-password ───

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(req.body);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        passwordReset: result.passwordReset,
      },
    });
  }
);

// ─── POST /auth/reset-password ───

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.resetPassword(req.body);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);

// ─── POST /auth/refresh ───

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  // Prefer cookie (HttpOnly, more secure). Fall back to Authorization header
  // for browsers that block third-party cookies (cross-site setups).
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const oldToken = req.cookies[REFRESH_COOKIE_NAME] || headerToken;

  if (!oldToken) {
    res.status(401).json({ success: false, message: 'No refresh token provided' });
    return;
  }

  const result = await authService.refreshAccessToken(oldToken);

  setRefreshCookie(res, result.refreshToken);

  res.status(200).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

// ─── POST /auth/logout ───

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // If user is authenticated, clear their stored refresh token
  if (req.user?.id) {
    await authService.logout(req.user.id);
  }

  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// ─── GET /auth/me ───

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});
