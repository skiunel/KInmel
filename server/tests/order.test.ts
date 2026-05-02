import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { Product } from '@/models/Product';
import { Order } from '@/models/Order';
import { createTestUser, createAdminUser, generateToken } from './helpers/auth.helper';
import { createTestCategory, createTestProduct } from './helpers/fixtures';

describe('Order API', () => {
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let productId: string;

  const shippingAddress = {
    fullName: 'Test User',
    phone: '9800000000',
    street: '123 Test St',
    city: 'Kathmandu',
    state: 'Bagmati',
    postalCode: '44600',
    country: 'Nepal',
  };

  beforeEach(async () => {
    const user = await createTestUser();
    const admin = await createAdminUser();
    userId = user._id.toString();
    userToken = generateToken(user);
    adminToken = generateToken(admin);

    const category = await createTestCategory();
    const product = await createTestProduct(category._id, {
      name: 'Order Product',
      slug: 'order-product',
      sku: 'ORD-1',
      price: 2000,
      stock: 20,
    });
    productId = product._id.toString();
  });

  // ─── Checkout ───

  describe('POST /orders/checkout', () => {
    it('should place order from cart', async () => {
      // Add to cart first
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId, quantity: 2 });

      const res = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ shippingAddress, paymentMethod: 'cod' });

      expect(res.status).toBe(201);
      expect(res.body.data.orderNumber).toMatch(/^KNM-/);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.paymentStatus).toBe('pending');
    });

    it('should decrement stock after checkout', async () => {
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId, quantity: 3 });

      await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ shippingAddress, paymentMethod: 'cod' });

      const product = await Product.findById(productId);
      expect(product!.stock).toBe(17); // 20 - 3
    });

    it('should clear cart after checkout', async () => {
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId, quantity: 1 });

      await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ shippingAddress, paymentMethod: 'cod' });

      const cartRes = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(cartRes.body.data.items).toHaveLength(0);
    });

    it('should reject checkout with empty cart', async () => {
      const res = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ shippingAddress, paymentMethod: 'cod' });

      expect(res.status).toBe(400);
    });

    it('should reject checkout without auth', async () => {
      const res = await request(app)
        .post('/api/v1/orders/checkout')
        .send({ shippingAddress, paymentMethod: 'cod' });

      expect(res.status).toBe(401);
    });
  });

  // ─── Order History ───

  describe('GET /orders', () => {
    it('should list user orders', async () => {
      // Place an order first
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId, quantity: 1 });

      await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ shippingAddress, paymentMethod: 'cod' });

      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should not show other users orders', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherToken = generateToken(otherUser);

      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });
  });

  // ─── Cancel Order ───

  describe('POST /orders/:id/cancel', () => {
    it('should cancel pending order and restore stock', async () => {
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId, quantity: 5 });

      const checkoutRes = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ shippingAddress, paymentMethod: 'cod' });

      const orderId = checkoutRes.body.data._id;

      const res = await request(app)
        .post(`/api/v1/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reason: 'Changed my mind' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('cancelled');

      // Stock should be restored
      const product = await Product.findById(productId);
      expect(product!.stock).toBe(20);
    });

    it('should reject cancellation of shipped order', async () => {
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId, quantity: 1 });

      const checkoutRes = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ shippingAddress, paymentMethod: 'cod' });

      const orderId = checkoutRes.body.data._id;

      // Admin updates to shipped
      await request(app)
        .put(`/api/v1/orders/admin/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'shipped', message: 'Shipped' });

      const res = await request(app)
        .post(`/api/v1/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reason: 'Too late' });

      expect(res.status).toBe(400);
    });
  });

  // ─── Admin: Update Order Status ───

  describe('PUT /orders/:id/status (admin)', () => {
    it('should update order status through delivery pipeline', async () => {
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId, quantity: 1 });

      const checkoutRes = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ shippingAddress, paymentMethod: 'cod' });

      const orderId = checkoutRes.body.data._id;

      // Confirm
      let res = await request(app)
        .put(`/api/v1/orders/admin/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed', message: 'Confirmed' });
      expect(res.body.data.status).toBe('confirmed');

      // Process
      res = await request(app)
        .put(`/api/v1/orders/admin/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing', message: 'Being processed' });
      expect(res.body.data.status).toBe('processing');

      // Ship
      res = await request(app)
        .put(`/api/v1/orders/admin/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'shipped', message: 'On the way' });
      expect(res.body.data.status).toBe('shipped');

      // Deliver
      res = await request(app)
        .put(`/api/v1/orders/admin/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'delivered', message: 'Delivered' });
      expect(res.body.data.status).toBe('delivered');
      expect(res.body.data.paymentStatus).toBe('paid');
      expect(res.body.data.deliveredAt).toBeDefined();
      expect(res.body.data.blockchainCode).toMatch(/^SDC-[A-F0-9]{16}$/);
      expect(res.body.data.blockchainTxHash ?? null).toBeNull();
    });

    it('should reject status update on delivered order', async () => {
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId, quantity: 1 });

      const checkoutRes = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ shippingAddress, paymentMethod: 'cod' });

      const orderId = checkoutRes.body.data._id;

      await request(app)
        .put(`/api/v1/orders/admin/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'delivered' });

      const res = await request(app)
        .put(`/api/v1/orders/admin/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'shipped' });

      expect(res.status).toBe(400);
    });

    it('should reject customer updating order status', async () => {
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId, quantity: 1 });

      const checkoutRes = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ shippingAddress, paymentMethod: 'cod' });

      const res = await request(app)
        .put(`/api/v1/orders/admin/${checkoutRes.body.data._id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'delivered' });

      expect(res.status).toBe(403);
    });

    it('should add delivery updates to timeline', async () => {
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId, quantity: 1 });

      const checkoutRes = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ shippingAddress, paymentMethod: 'cod' });

      const orderId = checkoutRes.body.data._id;

      await request(app)
        .put(`/api/v1/orders/admin/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'shipped', message: 'Shipped via courier', location: 'Kathmandu Hub' });

      const order = await Order.findById(orderId);
      expect(order!.deliveryUpdates.length).toBeGreaterThanOrEqual(2);
      const lastUpdate = order!.deliveryUpdates[order!.deliveryUpdates.length - 1];
      expect(lastUpdate.status).toBe('shipped');
      expect(lastUpdate.location).toBe('Kathmandu Hub');
    });
  });
});
