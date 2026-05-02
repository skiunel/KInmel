import { describe, it, expect } from 'vitest';
import {
  buildStoredReviewDocument,
  hashContent,
  readLocalMockReviewDocument,
  storeLocalMockReviewDocument,
  verifyContentIntegrity,
  type ReviewPayload,
} from '@/services/ipfs.service';

describe('IPFS Service — Unit Tests', () => {
  const payload: ReviewPayload = {
    rating: 5,
    title: 'Excellent product',
    content: 'I really loved this product, best purchase ever.',
    productId: '507f1f77bcf86cd799439011',
    orderId: '507f1f77bcf86cd799439012',
    userId: '507f1f77bcf86cd799439013',
    timestamp: '2026-01-01T00:00:00.000Z',
  };

  describe('hashContent', () => {
    it('should produce consistent SHA-256 hash', () => {
      const hash1 = hashContent(payload);
      const hash2 = hashContent(payload);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex = 64 chars
    });

    it('should produce different hash for different content', () => {
      const modified = { ...payload, rating: 4 };

      expect(hashContent(payload)).not.toBe(hashContent(modified));
    });

    it('should produce canonical hash regardless of key order', () => {
      const reordered: ReviewPayload = {
        userId: payload.userId,
        timestamp: payload.timestamp,
        rating: payload.rating,
        title: payload.title,
        content: payload.content,
        productId: payload.productId,
        orderId: payload.orderId,
      };

      expect(hashContent(payload)).toBe(hashContent(reordered));
    });
  });

  describe('verifyContentIntegrity', () => {
    it('should return true for matching hash', () => {
      const hash = hashContent(payload);
      expect(verifyContentIntegrity(payload, hash)).toBe(true);
    });

    it('should return false for tampered content', () => {
      const hash = hashContent(payload);
      const tampered = { ...payload, rating: 1 };
      expect(verifyContentIntegrity(tampered, hash)).toBe(false);
    });

    it('should return false for wrong hash', () => {
      expect(verifyContentIntegrity(payload, 'deadbeef'.repeat(8))).toBe(false);
    });
  });

  describe('local development mock storage helpers', () => {
    it('should persist and reload a locally mocked IPFS document', async () => {
      const document = buildStoredReviewDocument(payload);

      const cid = await storeLocalMockReviewDocument(document);
      const loaded = await readLocalMockReviewDocument(cid);

      expect(cid.startsWith('Qm_local_')).toBe(true);
      expect(loaded).toEqual(document);
    });
  });
});
