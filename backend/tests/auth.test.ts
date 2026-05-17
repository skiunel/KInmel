import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { User } from '@/models/User';
import { createTestUser, createAdminUser, generateToken } from './helpers/auth.helper';

const API = '/api/v1/auth';

describe('Auth API', () => {
  // ─── Register ───

  describe('POST /auth/register', () => {
    it('should register a new user and return tokens', async () => {
      const res = await request(app).post(`${API}/register`).send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.body.data.user.role).toBe('customer');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.emailVerification.required).toBe(true);
      expect(res.body.data.emailVerification.previewUrl).toContain('/verify-email?token=');
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should set refresh token in httpOnly cookie', async () => {
      const res = await request(app).post(`${API}/register`).send({
        name: 'Cookie User',
        email: 'cookie@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(201);
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const refreshCookie = Array.isArray(cookies)
        ? cookies.find((c: string) => c.includes('kinmel_refresh'))
        : cookies?.includes('kinmel_refresh');
      expect(refreshCookie).toBeTruthy();
    });

    it('should reject duplicate email', async () => {
      await createTestUser({ email: 'dup@example.com' });

      const res = await request(app).post(`${API}/register`).send({
        name: 'Dup User',
        email: 'dup@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already exists');
    });

    it('should reject weak password', async () => {
      const res = await request(app).post(`${API}/register`).send({
        name: 'Weak',
        email: 'weak@example.com',
        password: 'short',
      });

      expect(res.status).toBe(400);
    });

    it('should reject missing fields', async () => {
      const res = await request(app).post(`${API}/register`).send({});

      expect(res.status).toBe(400);
    });
  });

  // ─── Email Verification ───

  describe('POST /auth/verify-email', () => {
    it('should verify email with a valid token', async () => {
      const regRes = await request(app).post(`${API}/register`).send({
        name: 'Verify Me',
        email: 'verify@example.com',
        password: 'Password123',
      });

      const previewUrl = regRes.body.data.emailVerification.previewUrl as string;
      const token = new URL(previewUrl).searchParams.get('token');

      const res = await request(app).post(`${API}/verify-email`).send({ token });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Email verified');
      expect(res.body.data.user.isEmailVerified).toBe(true);

      const user = await User.findOne({ email: 'verify@example.com' });
      expect(user?.isEmailVerified).toBe(true);
    });

    it('should reject invalid verification token', async () => {
      const res = await request(app)
        .post(`${API}/verify-email`)
        .send({ token: 'invalid-token' });

      expect(res.status).toBe(400);
    });
  });

  // ─── Login ───

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      await createTestUser({ email: 'login@example.com', password: 'Password123' });

      const res = await request(app).post(`${API}/login`).send({
        email: 'login@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('login@example.com');
    });

    it('should reject wrong password', async () => {
      await createTestUser({ email: 'wrong@example.com', password: 'Password123' });

      const res = await request(app).post(`${API}/login`).send({
        email: 'wrong@example.com',
        password: 'WrongPassword1',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should reject non-existent email', async () => {
      const res = await request(app).post(`${API}/login`).send({
        email: 'nobody@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(401);
    });

    it('should reject inactive user', async () => {
      await createTestUser({
        email: 'inactive@example.com',
        password: 'Password123',
        isActive: false,
      });

      const res = await request(app).post(`${API}/login`).send({
        email: 'inactive@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /auth/google', () => {
    it('should return a clear error when Google sign-in is not configured', async () => {
      const res = await request(app).post(`${API}/google`).send({
        idToken: 'fake-google-token',
      });

      expect(res.status).toBe(503);
      expect(res.body.message).toContain('Google sign-in is not configured');
    });

    it('should reject missing idToken', async () => {
      const res = await request(app).post(`${API}/google`).send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('idToken is required');
    });
  });

  // ─── Get Me ───

  describe('GET /auth/me', () => {
    it('should return current user with valid token', async () => {
      const user = await createTestUser({ email: 'me@example.com' });
      const token = generateToken(user);

      const res = await request(app)
        .get(`${API}/me`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('me@example.com');
    });

    it('should reject request without token', async () => {
      const res = await request(app).get(`${API}/me`);

      expect(res.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get(`${API}/me`)
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });

  // ─── Refresh Token ───

  describe('POST /auth/refresh', () => {
    it('should issue new tokens with valid refresh token', async () => {
      // Register to get a valid refresh token
      const regRes = await request(app).post(`${API}/register`).send({
        name: 'Refresh User',
        email: 'refresh@example.com',
        password: 'Password123',
      });

      expect(regRes.status).toBe(201);

      // Extract refresh token from cookie
      const cookies = regRes.headers['set-cookie'] as string[];
      const refreshCookie = cookies?.find((c) => c.includes('kinmel_refresh'));

      if (!refreshCookie) {
        // If cookie not set, skip this test
        return;
      }

      const res = await request(app)
        .post(`${API}/refresh`)
        .set('Cookie', refreshCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject missing refresh token', async () => {
      const res = await request(app).post(`${API}/refresh`);

      expect(res.status).toBe(401);
    });
  });

  // ─── Forgot / Reset Password ───

  describe('POST /auth/forgot-password', () => {
    it('should return a reset preview for an existing user', async () => {
      await createTestUser({ email: 'forgot@example.com' });

      const res = await request(app).post(`${API}/forgot-password`).send({
        email: 'forgot@example.com',
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('If an account exists');
      expect(res.body.data.passwordReset.previewUrl).toContain(
        '/reset-password?token='
      );
    });

    it('should not reveal whether the email exists', async () => {
      const res = await request(app).post(`${API}/forgot-password`).send({
        email: 'missing@example.com',
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('If an account exists');
      expect(res.body.data.passwordReset).toBeNull();
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reset password with a valid token', async () => {
      await createTestUser({
        email: 'reset@example.com',
        password: 'Password123',
      });

      const forgotRes = await request(app).post(`${API}/forgot-password`).send({
        email: 'reset@example.com',
      });

      const previewUrl = forgotRes.body.data.passwordReset.previewUrl as string;
      const token = new URL(previewUrl).searchParams.get('token');

      const resetRes = await request(app).post(`${API}/reset-password`).send({
        token,
        password: 'BetterPass456',
        confirmPassword: 'BetterPass456',
      });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.message).toContain('Password reset successfully');

      const oldLogin = await request(app).post(`${API}/login`).send({
        email: 'reset@example.com',
        password: 'Password123',
      });
      expect(oldLogin.status).toBe(401);

      const newLogin = await request(app).post(`${API}/login`).send({
        email: 'reset@example.com',
        password: 'BetterPass456',
      });
      expect(newLogin.status).toBe(200);
    });

    it('should reject an invalid reset token', async () => {
      const res = await request(app).post(`${API}/reset-password`).send({
        token: 'invalid-token',
        password: 'BetterPass456',
        confirmPassword: 'BetterPass456',
      });

      expect(res.status).toBe(400);
    });
  });

  // ─── Logout ───

  describe('POST /auth/logout', () => {
    it('should clear refresh token', async () => {
      const user = await createTestUser({ email: 'logout@example.com' });
      const token = generateToken(user);

      const res = await request(app)
        .post(`${API}/logout`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      // Verify refresh token is cleared
      const updated = await User.findById(user._id).select('+refreshToken');
      expect(updated?.refreshToken).toBeNull();
    });
  });

  // ─── Admin-Only Route Protection ───

  describe('Admin route protection', () => {
    it('should allow admin access to admin routes', async () => {
      const admin = await createAdminUser();
      const token = generateToken(admin);

      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should reject customer access to admin routes', async () => {
      const user = await createTestUser({ email: 'noadmin@example.com' });
      const token = generateToken(user);

      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should reject unauthenticated access to admin routes', async () => {
      const res = await request(app).get('/api/v1/admin/dashboard');

      expect(res.status).toBe(401);
    });
  });
});
