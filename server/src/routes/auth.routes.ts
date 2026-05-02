import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validators';
import { env } from '../config/env';
import rateLimit from 'express-rate-limit';

const router = Router();

// ─── Auth-specific rate limiting ───

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
});

// ─── Optional Auth Middleware ───
// Tries to extract user from token but never fails.

function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], env.JWT_ACCESS_SECRET) as {
      id: string;
      email: string;
      role: 'customer' | 'admin';
    };
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
  } catch {
    // Invalid/expired — proceed without user
  }

  next();
}

// ─── Routes ───

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/google', authLimiter, authController.googleLogin);
router.post(
  '/verify-email',
  authLimiter,
  validate(verifyEmailSchema),
  authController.verifyEmail
);
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.post('/refresh', authController.refresh);
router.post('/logout', optionalAuth, authController.logout);
router.get('/me', authenticate, authController.getMe);

export { router as authRouter };
