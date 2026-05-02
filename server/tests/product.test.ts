import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { createTestUser, createAdminUser, generateToken } from './helpers/auth.helper';
import { createTestCategory, createTestProduct } from './helpers/fixtures';

const API = '/api/v1/products';

describe('Product API', () => {
  let adminToken: string;
  let userToken: string;
  let categoryId: string;

  beforeEach(async () => {
    const admin = await createAdminUser();
    const user = await createTestUser({ email: 'user@example.com' });
    adminToken = generateToken(admin);
    userToken = generateToken(user);
    const category = await createTestCategory();
    categoryId = category._id.toString();
  });

  // ─── Public Routes ───

  describe('GET /products', () => {
    it('should list products with pagination', async () => {
      await createTestProduct(categoryId, { name: 'Prod A', slug: 'prod-a', sku: 'SKU-A' });
      await createTestProduct(categoryId, { name: 'Prod B', slug: 'prod-b', sku: 'SKU-B' });

      const res = await request(app).get(API);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(2);
    });

    it('should filter by category', async () => {
      const cat2 = await createTestCategory({ name: 'Cat2', slug: 'cat2' });
      await createTestProduct(categoryId, { name: 'P1', slug: 'p1', sku: 'S1' });
      await createTestProduct(cat2._id, { name: 'P2', slug: 'p2', sku: 'S2' });

      const res = await request(app).get(`${API}?category=${categoryId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should only return active products', async () => {
      await createTestProduct(categoryId, { name: 'Active', slug: 'active', sku: 'ACT', isActive: true });
      await createTestProduct(categoryId, { name: 'Hidden', slug: 'hidden', sku: 'HID', isActive: false });

      const res = await request(app).get(API);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Active');
    });
  });

  describe('GET /products/:slug', () => {
    it('should get product by slug', async () => {
      await createTestProduct(categoryId, { name: 'Slug Prod', slug: 'slug-prod', sku: 'SLG' });

      const res = await request(app).get(`${API}/slug-prod`);

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Slug Prod');
    });

    it('should return 404 for non-existent slug', async () => {
      const res = await request(app).get(`${API}/nonexistent`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /products/featured', () => {
    it('should return only featured products', async () => {
      await createTestProduct(categoryId, { name: 'Feat', slug: 'feat', sku: 'F1', isFeatured: true });
      await createTestProduct(categoryId, { name: 'Normal', slug: 'norm', sku: 'N1', isFeatured: false });

      const res = await request(app).get(`${API}/featured`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Feat');
    });
  });

  // ─── Admin CRUD ───

  describe('POST /products (admin)', () => {
    it('should create product as admin', async () => {
      const res = await request(app)
        .post(API)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Product',
          slug: 'new-product',
          description: 'A brand new product',
          price: 2500,
          images: [],
          category: categoryId,
          sku: 'NEW-SKU',
          stock: 100,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('New Product');
    });

    it('should reject product creation by customer', async () => {
      const res = await request(app)
        .post(API)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Hack Product',
          slug: 'hack',
          description: 'Should not work',
          price: 100,
          category: categoryId,
          sku: 'HACK',
        });

      expect(res.status).toBe(403);
    });

    it('should reject product creation without auth', async () => {
      const res = await request(app).post(API).send({
        name: 'No Auth',
        slug: 'no-auth',
        description: 'Test',
        price: 100,
        category: categoryId,
        sku: 'NO',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /products/:id (admin)', () => {
    it('should update product', async () => {
      const product = await createTestProduct(categoryId, {
        name: 'Old Name',
        slug: 'old-name',
        sku: 'OLD',
      });

      const res = await request(app)
        .put(`${API}/${product._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New Name', price: 999 });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('New Name');
      expect(res.body.data.price).toBe(999);
    });
  });

  describe('DELETE /products/:id (admin)', () => {
    it('should soft-delete product', async () => {
      const product = await createTestProduct(categoryId, {
        name: 'Delete Me',
        slug: 'delete-me',
        sku: 'DEL',
      });

      const res = await request(app)
        .delete(`${API}/${product._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });
});
