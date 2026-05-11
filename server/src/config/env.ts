import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),

  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // CORS
  CLIENT_URL: z.string().url().default('http://localhost:3000'),

  // IPFS (optional in dev)
  PINATA_API_KEY: z.string().optional(),
  PINATA_SECRET_KEY: z.string().optional(),
  PINATA_JWT: z.string().optional(),
  PINATA_GATEWAY: z.string().optional(),

  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Blockchain (optional in dev)
  BLOCKCHAIN_RPC_URL: z.string().optional(),
  REVIEW_CONTRACT_ADDRESS: z.string().optional(),
  DEPLOYER_PRIVATE_KEY: z.string().optional(),

  // Stripe (optional in dev)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // eSewa (optional)
  ESEWA_MERCHANT_ID: z.string().optional(),
  ESEWA_SECRET_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment validation failed:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
