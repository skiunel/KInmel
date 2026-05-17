import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { createTestUser, generateToken } from './helpers/auth.helper';
import { createTestCategory, createTestProduct } from './helpers/fixtures';

const API = '/api/v1/cart';

describe('Cart API', () => {
  let token: string;
  let productId: string;

  beforeEach(async () => {
    const user = await createTestUser();
    token = generateToken(user);
    const category = await createTestCategory();
    const product = await createTestProduct(category._id, {
      name: 'Cart Item',
      slug: 'cart-item',
      sku: 'CART-1',
      price: 1000,
      stock: 10,
    });
    productId = product._id.toString();
  });

  // ─── Auth Required ───

  describe('Authentication', () => {
    it('should reject unauthenticated cart access', async () => {
      const res = await request(app).get(API);
      expect(res.status).toBe(401);
    });

    it('should reject unauthenticated add to cart', async () => {
      const res = await request(app)
        .post(`${API}/items`)
        .send({ productId, quantity: 1 });
      expect(res.status).toBe(401);
    });
  });

  // ─── Get Cart ───

  describe('GET /cart', () => {
    it('should return empty cart for new user', async () => {
      const res = await request(app)
        .get(API)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.itemCount).toBe(0);
      expect(res.body.data.subtotal).toBe(0);
    });
  });

  // ─── Add to Cart ───

  describe('POST /cart/items', () => {
    it('should add product to cart', async () => {
      const res = await request(app)
        .post(`${API}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({ productId, quantity: 2 });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].quantity).toBe(2);
      expect(res.body.data.itemCount).toBe(2);
      expect(res.body.data.subtotal).toBe(2000);
    });

    it('should increment quantity when adding same product', async () => {
      await request(app)
        .post(`${API}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({ productId, quantity: 2 });

      const res = await request(app)
        .post(`${API}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({ productId, quantity: 3 });

      expect(res.status).toBe(200);
      expect(res.body.data.items[0].quantity).toBe(5);
    });

    it('should reject when exceeding stock', async () => {
      const res = await request(app)
        .post(`${API}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({ productId, quantity: 999 });

      expect(res.status).toBe(400);
    });

    it('should reject when exceeding max quantity per item', async () => {
      // Add up to limit then try to exceed
      await request(app)
        .post(`${API}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({ productId, quantity: 10 });

      const res = await request(app)
        .post(`${API}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({ productId, quantity: 1 });

      expect(res.status).toBe(400);
    });

    it('should reject inactive/nonexistent product', async () => {
      const category = await createTestCategory({ name: 'C2', slug: 'c2' });
      const inactive = await createTestProduct(category._id, {
        name: 'Inactive',
        slug: 'inactive',
        sku: 'INACT',
        isActive: false,
      });

      const res = await request(app)
        .post(`${API}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: inactive._id.toString(), quantity: 1 });

      expect(res.status).toBe(404);
    });
  });

  // ─── Update Item ───

  describe('PUT /cart/items/:productId', () => {
    it('should update item quantity', async () => {
      await request(app)
        .post(`${API}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({ productId, quantity: 1 });

      const res = await request(app)
        .put(`${API}/items/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.data.items[0].quantity).toBe(5);
    });

    it('should reject update for non-existent item', async () => {
      // Create a cart first
      await request(app)
        .get(API)
        .set('Authorization', `Bearer ${token}`);

      const res = await request(app)
        .put(`${API}/items/507f1f77bcf86cd799439011`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 1 });

      expect(res.status).toBe(404);
    });
  });

  // ─── Remove Item ───

  describe('DELETE /cart/items/:productId', () => {
    it('should remove item from cart', async () => {
      await request(app)
        .post(`${API}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({ productId, quantity: 1 });

      const res = await request(app)
        .delete(`${API}/items/${productId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(0);
    });
  });

  // ─── Clear Cart ───

  describe('DELETE /cart', () => {
    it('should clear all items', async () => {
      await request(app)
        .post(`${API}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({ productId, quantity: 2 });

      const res = await request(app)
        .delete(API)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.itemCount).toBe(0);
    });
  });

  // ─── Cart Calculations ───

  describe('Cart totals', () => {
    it('should calculate tax and shipping correctly', async () => {
      await request(app)
        .post(`${API}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({ productId, quantity: 2 }); // 2 x 1000 = 2000

      const res = await request(app)
        .get(API)
        .set('Authorization', `Bearer ${token}`);

      const cart = res.body.data;
      expect(cart.subtotal).toBe(2000);
      expect(cart.shippingCost).toBe(150); // below 5000 threshold
      expect(cart.taxAmount).toBe(260); // 2000 * 0.13 = 260
      expect(cart.totalAmount).toBe(2410); // 2000 + 150 + 260
    });

    it('should give free shipping above threshold', async () => {
      // Create expensive product
      const category = await createTestCategory({ name: 'Exp', slug: 'exp' });
      const expensive = await createTestProduct(category._id, {
        name: 'Expensive',
        slug: 'expensive',
        sku: 'EXP',
        price: 5000,
        stock: 10,
      });

      await request(app)
        .post(`${API}/items`)
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: expensive._id.toString(), quantity: 1 });

      const res = await request(app)
        .get(API)
        .set('Authorization', `Bearer ${token}`);

      expect(res.body.data.shippingCost).toBe(0);
    });
  });
});
