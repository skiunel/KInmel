import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { Review } from '@/models/Review';
import {
  buildStoredReviewDocument,
  storeLocalMockReviewDocument,
} from '@/services/ipfs.service';
import { createTestUser, createAdminUser, generateToken } from './helpers/auth.helper';
import {
  createTestCategory,
  createTestProduct,
  createDeliveredOrder,
} from './helpers/fixtures';

describe('Review API', () => {
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let productId: string;
  let orderId: string;

  beforeEach(async () => {
    const user = await createTestUser();
    const admin = await createAdminUser();
    userId = user._id.toString();
    userToken = generateToken(user);
    adminToken = generateToken(admin);

    const category = await createTestCategory();
    const product = await createTestProduct(category._id, {
      name: 'Review Product',
      slug: 'review-product',
      sku: 'REV-1',
      price: 1500,
    });
    productId = product._id.toString();

    const order = await createDeliveredOrder(userId, [
      { _id: product._id, name: product.name, price: product.price, sku: product.sku },
    ]);
    orderId = order._id.toString();
  });

  // ─── Eligibility ───

  describe('GET /reviews/eligibility/:orderId', () => {
    it('should return eligible for delivered order', async () => {
      const res = await request(app)
        .get(`/api/v1/reviews/eligibility/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].eligible).toBe(true);
      expect(res.body.data[0].productId).toBe(productId);
    });

    it('should return ineligible for pending order', async () => {
      const category = await createTestCategory({ name: 'C2', slug: 'c2' });
      const product2 = await createTestProduct(category._id, {
        name: 'P2',
        slug: 'p2',
        sku: 'P2',
      });

      // Create a pending order (not delivered)
      const { Order } = await import('@/models/Order');
      const pendingOrder = await Order.create({
        orderNumber: `KNM-PEND-${Date.now()}`,
        user: userId,
        items: [
          {
            product: product2._id,
            name: product2.name,
            price: product2.price,
            quantity: 1,
            image: '',
            sku: product2.sku,
          },
        ],
        shippingAddress: {
          fullName: 'Test',
          phone: '9800000000',
          street: 'St',
          city: 'KTM',
          state: 'B',
          postalCode: '44600',
        },
        subtotal: product2.price,
        shippingCost: 150,
        taxRate: 0.13,
        taxAmount: 195,
        totalAmount: 1845,
        status: 'pending',
        paymentStatus: 'pending',
      });

      const res = await request(app)
        .get(`/api/v1/reviews/eligibility/${pendingOrder._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data[0].eligible).toBe(false);
      expect(res.body.data[0].reason).toContain('delivered');
    });

    it('should mark already-reviewed product as ineligible', async () => {
      // Create a review first
      await Review.create({
        user: userId,
        product: productId,
        order: orderId,
        rating: 5,
        title: 'Great',
        content: 'This is a great product I love it',
      });

      const res = await request(app)
        .get(`/api/v1/reviews/eligibility/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data[0].eligible).toBe(false);
      expect(res.body.data[0].existingReview).toBeDefined();
    });

    it('should reject eligibility check without auth', async () => {
      const res = await request(app).get(`/api/v1/reviews/eligibility/${orderId}`);
      expect(res.status).toBe(401);
    });

    it('should reject eligibility for another users order', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherToken = generateToken(otherUser);

      const res = await request(app)
        .get(`/api/v1/reviews/eligibility/${orderId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ─── Create Review ───

  describe('POST /reviews', () => {
    it('should create review for delivered order', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId,
          productId,
          rating: 4,
          title: 'Good product',
          content: 'Really enjoyed this product, highly recommend it.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.rating).toBe(4);
      expect(res.body.data.title).toBe('Good product');
      // IPFS dev stub should set contentHash and ipfsHash
      expect(res.body.data.contentHash).toBeDefined();
      expect(res.body.data.ipfsHash).toBeDefined();
      expect(res.body.data.verificationStatus).toBe('stored');
    });

    it('should reject duplicate review', async () => {
      const reviewInput = {
        orderId,
        productId,
        rating: 5,
        title: 'First review',
        content: 'This is my first and only review for this.',
      };

      await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewInput);

      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewInput);

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already reviewed');
    });

    it('should reject review for non-delivered order', async () => {
      const { Order } = await import('@/models/Order');
      const category = await createTestCategory({ name: 'C3', slug: 'c3' });
      const product = await createTestProduct(category._id, {
        name: 'P3',
        slug: 'p3',
        sku: 'P3',
      });

      const pendingOrder = await Order.create({
        orderNumber: `KNM-PND-${Date.now()}`,
        user: userId,
        items: [
          {
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: '',
            sku: product.sku,
          },
        ],
        shippingAddress: {
          fullName: 'Test',
          phone: '9800000000',
          street: 'St',
          city: 'KTM',
          state: 'B',
          postalCode: '44600',
        },
        subtotal: product.price,
        shippingCost: 150,
        taxRate: 0.13,
        taxAmount: 130,
        totalAmount: 1280,
        status: 'processing',
        paymentStatus: 'pending',
      });

      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: pendingOrder._id.toString(),
          productId: product._id.toString(),
          rating: 3,
          title: 'Should fail',
          content: 'This review should not be created at all.',
        });

      expect(res.status).toBe(403);
    });

    it('should reject review for product not in order', async () => {
      const category = await createTestCategory({ name: 'C4', slug: 'c4' });
      const otherProduct = await createTestProduct(category._id, {
        name: 'Other',
        slug: 'other',
        sku: 'OTH',
      });

      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId,
          productId: otherProduct._id.toString(),
          rating: 3,
          title: 'Wrong product',
          content: 'This product was not in my order at all.',
        });

      expect(res.status).toBe(400);
    });

    it('should reject review without auth', async () => {
      const res = await request(app).post('/api/v1/reviews').send({
        orderId,
        productId,
        rating: 5,
        title: 'No auth',
        content: 'Should not work without authentication.',
      });

      expect(res.status).toBe(401);
    });

    it('should reject review with invalid rating', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId,
          productId,
          rating: 6,
          title: 'Bad rating',
          content: 'Rating out of bounds should fail validation.',
        });

      expect(res.status).toBe(400);
    });
  });

  // ─── Get Product Reviews (Public) ───

  describe('GET /reviews/product/:productId', () => {
    it('should return reviews for a product', async () => {
      await Review.create({
        user: userId,
        product: productId,
        order: orderId,
        rating: 4,
        title: 'Nice',
        content: 'Really nice product worth buying',
      });

      const res = await request(app).get(`/api/v1/reviews/product/${productId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.ratingBreakdown).toBeDefined();
      expect(res.body.ratingBreakdown[4]).toBe(1);
    });

    it('should exclude flagged reviews', async () => {
      await Review.create({
        user: userId,
        product: productId,
        order: orderId,
        rating: 1,
        title: 'Flagged',
        content: 'This review has been flagged for moderation',
        isFlagged: true,
      });

      const res = await request(app).get(`/api/v1/reviews/product/${productId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });
  });

  describe('GET /reviews/ipfs/:cid', () => {
    it('should return a locally mocked IPFS document', async () => {
      const document = buildStoredReviewDocument({
        rating: 5,
        title: 'Locally mocked',
        content: 'This content lives in the local development proof store.',
        productId,
        orderId,
        userId,
        timestamp: new Date().toISOString(),
      });
      const cid = await storeLocalMockReviewDocument(document);

      const res = await request(app).get(`/api/v1/reviews/ipfs/${cid}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(document);
    });
  });

  // ─── Admin: Flag Review ───

  describe('PUT /admin/reviews/:id/flag', () => {
    it('should flag a review', async () => {
      const review = await Review.create({
        user: userId,
        product: productId,
        order: orderId,
        rating: 2,
        title: 'Bad',
        content: 'This is a spam review that needs flagging',
      });

      const res = await request(app)
        .put(`/api/v1/reviews/admin/${review._id}/flag`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isFlagged: true, flagReason: 'Spam' });

      expect(res.status).toBe(200);
      expect(res.body.data.isFlagged).toBe(true);
    });

    it('should reject flag by customer', async () => {
      const review = await Review.create({
        user: userId,
        product: productId,
        order: orderId,
        rating: 3,
        title: 'Mid',
        content: 'Average product nothing special at all',
      });

      const res = await request(app)
        .put(`/api/v1/reviews/admin/${review._id}/flag`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ isFlagged: true });

      expect(res.status).toBe(403);
    });
  });

  // ─── Admin: Delete Review ───

  describe('DELETE /admin/reviews/:id', () => {
    it('should delete review and recalculate rating', async () => {
      const review = await Review.create({
        user: userId,
        product: productId,
        order: orderId,
        rating: 1,
        title: 'Delete me',
        content: 'This review should be deleted by admin',
      });

      const res = await request(app)
        .delete(`/api/v1/reviews/admin/${review._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const found = await Review.findById(review._id);
      expect(found).toBeNull();
    });
  });
});
