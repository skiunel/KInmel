import { User } from '@/models/User';
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

export async function createTestUser(overrides: Record<string, unknown> = {}) {
  return User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123',
    role: 'customer',
    ...overrides,
  });
}

export async function createAdminUser(overrides: Record<string, unknown> = {}) {
  return User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin12345',
    role: 'admin',
    ...overrides,
  });
}

export function generateToken(user: { _id: unknown; email: string; role: string }) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}
