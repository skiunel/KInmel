import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { env } from '../config/env';
import { ApiError } from '../utils/api-error';
import { Role } from '../config/constants';
import type {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../validators/auth.validators';
import { verifyGoogleToken } from './google-auth.service';

// ─── Token Payloads ───

interface TokenPayload {
  id: string;
  email: string;
  role: Role;
}

interface PreviewLink {
  previewUrl: string | null;
  expiresAt: Date | null;
}

const ONE_TIME_TOKEN_TTL_MS = 60 * 60 * 1000;

const createOpaqueToken = (): string => crypto.randomBytes(32).toString('hex');

const hashOpaqueToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

const buildPreviewUrl = (
  path: string,
  token: string
): string | null => {
  if (env.NODE_ENV === 'production') {
    return null;
  }

  const url = new URL(path, env.CLIENT_URL);
  url.searchParams.set('token', token);
  return url.toString();
};

const issueEmailVerificationToken = (user: IUser): PreviewLink => {
  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + ONE_TIME_TOKEN_TTL_MS);

  user.emailVerificationTokenHash = hashOpaqueToken(token);
  user.emailVerificationExpiresAt = expiresAt;

  return {
    previewUrl: buildPreviewUrl('/verify-email', token),
    expiresAt,
  };
};

const clearEmailVerificationState = (user: IUser) => {
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpiresAt = null;
};

const issuePasswordResetToken = (user: IUser): PreviewLink => {
  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + ONE_TIME_TOKEN_TTL_MS);

  user.passwordResetTokenHash = hashOpaqueToken(token);
  user.passwordResetExpiresAt = expiresAt;

  return {
    previewUrl: buildPreviewUrl('/reset-password', token),
    expiresAt,
  };
};

const clearPasswordResetState = (user: IUser) => {
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
};

// ─── Token Generation ───

const generateAccessToken = (user: IUser): string => {
  const payload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as unknown as import('ms').StringValue,
  });
};

const generateRefreshToken = (user: IUser): string => {
  const payload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as unknown as import('ms').StringValue,
  });
};

// ─── Register ───

export const register = async (input: RegisterInput) => {
  // Check for existing user
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  // Create user (password is hashed by the pre-save hook)
  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    phone: input.phone || null,
  });

  const emailVerification = issueEmailVerificationToken(user);

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Persist refresh token
  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  await user.save();

  return {
    user: user.toPublicJSON(),
    accessToken,
    refreshToken,
    emailVerification: {
      required: !user.isEmailVerified,
      ...emailVerification,
    },
  };
};

// ─── Login ───

export const login = async (input: LoginInput) => {
  // Find user WITH password (select: false by default)
  const user = await User.findOne({ email: input.email }).select('+password');

  if (!user) {
    // Deliberately vague message to prevent email enumeration
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
  }

  // Compare passwords
  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Persist refresh token + login timestamp
  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  await user.save();

  return {
    user: user.toPublicJSON(),
    accessToken,
    refreshToken,
  };
};

// ─── Google Login ───

export const googleLogin = async (idToken: string) => {
  const googleProfile = await verifyGoogleToken(idToken);

  // Find user by googleId or email
  let user = await User.findOne({
    $or: [{ googleId: googleProfile.googleId }, { email: googleProfile.email }],
  });

  if (!user) {
    // Create new user from Google profile
    user = await User.create({
      name: googleProfile.name,
      email: googleProfile.email,
      googleId: googleProfile.googleId,
      avatar: googleProfile.avatar,
      role: 'customer',
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    });
  } else if (!user.googleId) {
    // Link Google account to existing user
    user.googleId = googleProfile.googleId;
    if (googleProfile.avatar && !user.avatar) {
      user.avatar = googleProfile.avatar;
    }
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      user.emailVerifiedAt = new Date();
      clearEmailVerificationState(user);
    }
    await user.save();
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  await user.save();

  return {
    user: user.toPublicJSON(),
    accessToken,
    refreshToken,
  };
};

// ─── Refresh Token ───

export const refreshAccessToken = async (oldRefreshToken: string) => {
  // Verify the token signature
  let payload: TokenPayload;
  try {
    payload = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  // Find user and verify the stored token matches
  const user = await User.findById(payload.id).select('+refreshToken');

  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User not found or deactivated');
  }

  if (user.refreshToken !== oldRefreshToken) {
    // Token reuse detected — possible theft. Invalidate all sessions.
    user.refreshToken = null;
    await user.save();
    throw ApiError.unauthorized('Refresh token has been revoked. Please log in again.');
  }

  // Rotate: issue new pair
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: user.toPublicJSON(),
    accessToken,
    refreshToken,
  };
};

// ─── Logout ───

export const logout = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

// ─── Verify Email ───

export const verifyEmail = async (input: VerifyEmailInput) => {
  const tokenHash = hashOpaqueToken(input.token);
  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpiresAt: { $gt: new Date() },
  }).select('+emailVerificationTokenHash +emailVerificationExpiresAt');

  if (!user) {
    throw ApiError.badRequest('Verification token is invalid or has expired');
  }

  user.isEmailVerified = true;
  user.emailVerifiedAt = new Date();
  clearEmailVerificationState(user);
  await user.save();

  return {
    message: 'Email verified successfully',
    user: user.toPublicJSON(),
  };
};

// ─── Forgot Password ───

export const forgotPassword = async (input: ForgotPasswordInput) => {
  const user = await User.findOne({
    email: input.email,
    isActive: true,
  }).select('+passwordResetTokenHash +passwordResetExpiresAt');

  if (!user) {
    return {
      message:
        'If an account exists for that email, password reset instructions have been generated.',
      passwordReset: null,
    };
  }

  const passwordReset = issuePasswordResetToken(user);
  await user.save();

  return {
    message:
      'If an account exists for that email, password reset instructions have been generated.',
    passwordReset,
  };
};

// ─── Reset Password ───

export const resetPassword = async (input: ResetPasswordInput) => {
  const tokenHash = hashOpaqueToken(input.token);
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select(
    '+password +refreshToken +passwordResetTokenHash +passwordResetExpiresAt'
  );

  if (!user) {
    throw ApiError.badRequest('Password reset token is invalid or has expired');
  }

  user.password = input.password;
  user.refreshToken = null;
  clearPasswordResetState(user);
  await user.save();

  return {
    message: 'Password reset successfully',
  };
};

// ─── Get Current User ───

export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw ApiError.notFound('User not found');
  }

  return user.toPublicJSON();
};
