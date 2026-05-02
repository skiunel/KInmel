import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';

// Set test env vars before anything imports env.ts
process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:47017/kinmel_test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-1234567890';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-1234567890';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.BLOCKCHAIN_RPC_URL = '';
process.env.REVIEW_CONTRACT_ADDRESS = '';
process.env.DEPLOYER_PRIVATE_KEY = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
