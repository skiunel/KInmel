import { describe, it, expect } from 'vitest';
import { isBlockchainConfigured } from '@/services/blockchain.service';

describe('Blockchain Service — Unit Tests', () => {
  describe('isBlockchainConfigured', () => {
    it('should return false when env vars are not set', () => {
      // In test setup, blockchain env vars are not set
      expect(isBlockchainConfigured()).toBe(false);
    });
  });

  // Note: Full integration tests with a live Hardhat node are covered
  // in blockchain/test/ReviewProof.test.ts using Hardhat's test framework.
  // The backend service tests here verify graceful behavior when blockchain
  // is not configured (dev/test mode).
});
