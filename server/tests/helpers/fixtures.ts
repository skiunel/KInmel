import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { Order } from '@/models/Order';
import { Cart } from '@/models/Cart';
import mongoose from 'mongoose';

export async function createTestCategory(overrides: Record<string, unknown> = {}) {
  return Category.create({
    name: 'Test Category',
    slug: 'test-category',
    description: 'A test category',
    ...overrides,
  });
}

export async function createTestProduct(
  categoryId: string | mongoose.Types.ObjectId,
  overrides: Record<string, unknown> = {}
) {
  const id = new mongoose.Types.ObjectId();
  return Product.create({
    _id: id,
    name: `Test Product ${id}`,
    slug: `test-product-${id}`,
    description: 'A test product description that is long enough',
    price: 1000,
    images: ['https://images.unsplash.com/test'],
    category: categoryId,
    sku: `SKU-${id}`,
    stock: 50,
    isActive: true,
    ...overrides,
  });
}

export async function createDeliveredOrder(
  userId: string | mongoose.Types.ObjectId,
  products: Array<{ _id: unknown; name: string; price: number; sku: string }>
) {
  return Order.create({
    orderNumber: `KNM-TEST-${Date.now()}`,
    user: userId,
    items: products.map((p) => ({
      product: p._id,
      name: p.name,
      price: p.price,
      quantity: 1,
      image: '',
      sku: p.sku,
    })),
    shippingAddress: {
      fullName: 'Test User',
      phone: '9800000000',
      street: '123 Test St',
      city: 'Kathmandu',
      state: 'Bagmati',
      postalCode: '44600',
      country: 'Nepal',
    },
    subtotal: products.reduce((s, p) => s + p.price, 0),
    shippingCost: 150,
    taxRate: 0.13,
    taxAmount: Math.round(products.reduce((s, p) => s + p.price, 0) * 0.13),
    totalAmount: 0,
    status: 'delivered',
    paymentStatus: 'paid',
    deliveredAt: new Date(),
    deliveryUpdates: [
      { status: 'pending', message: 'Order placed', timestamp: new Date() },
      { status: 'delivered', message: 'Delivered', timestamp: new Date() },
    ],
  });
}

export async function createTestCart(
  userId: string | mongoose.Types.ObjectId,
  items: Array<{ product: unknown; quantity: number; price: number }>
) {
  return Cart.create({ user: userId, items });
}
