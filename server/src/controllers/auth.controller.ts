import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/async-handler';
import { env } from '../config/env';

// ─── Cookie Config ───

const REFRESH_COOKIE_NAME = 'kinmel_refresh';

const refreshCookieOptions = {
  httpOnly: true,                               // Not accessible via JS
  secure: env.NODE_ENV === 'production',        // HTTPS only in prod
  sameSite: 'strict' as const,                  // CSRF protection
  path: '/api/v1/auth',                         // Only sent to auth routes
  maxAge: 7 * 24 * 60 * 60 * 1000,             // 7 days in ms
};

// Helper: set refresh token cookie
const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions);
};

// Helper: clear refresh token cookie
const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
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
  const oldToken = req.cookies[REFRESH_COOKIE_NAME];

  if (!oldToken) {
    res.status(401).json({ success: false, message: 'No refresh token provided' });
    return;
  }

  const result = await authService.refreshAccessToken(oldToken);

  // Rotate the cookie with the new refresh token
  setRefreshCookie(res, result.refreshToken);

  res.status(200).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
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
