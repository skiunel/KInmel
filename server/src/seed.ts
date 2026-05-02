import 'dotenv/config';
import mongoose from 'mongoose';
import { Category } from './models/Category';
import { Product } from './models/Product';
import { User } from './models/User';
import { Order } from './models/Order';
import { Review, type IReview } from './models/Review';
import {
  pinReviewToIPFS,
  type ReviewPayload,
} from './services/ipfs.service';
import {
  anchorReviewOnChain,
  isBlockchainConfigured,
} from './services/blockchain.service';
import { VERIFICATION_STATUSES } from './config/constants';

function randomDate(daysAgo: number): Date {
  const now = Date.now();
  return new Date(now - Math.random() * daysAgo * 24 * 60 * 60 * 1000);
}

function orderNumber(): string {
  return `KNM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kinmel';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clear all collections
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // ─── Categories ───
  const categories = await Category.insertMany([
    { name: 'Electronics', slug: 'electronics', description: 'Gadgets and devices', displayOrder: 1, isActive: true },
    { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel', displayOrder: 2, isActive: true },
    { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Home essentials', displayOrder: 3, isActive: true },
    { name: 'Books', slug: 'books', description: 'Knowledge and stories', displayOrder: 4, isActive: true },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Active lifestyle gear', displayOrder: 5, isActive: true },
  ]);
  console.log(`${categories.length} categories seeded`);

  // ─── Products ───
  const products = await Product.insertMany([
    { name: 'Premium Wireless Headphones', slug: 'premium-wireless-headphones', description: 'High-fidelity wireless headphones with active noise cancellation, 30-hour battery life, and premium comfort padding.', shortDescription: 'ANC headphones with 30hr battery', price: 8999, compareAtPrice: 12999, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'], category: categories[0]._id, tags: ['wireless', 'audio'], sku: 'ELEC-WH-001', stock: 25, isFeatured: true, averageRating: 0, reviewCount: 0 },
    { name: 'Smart Watch Pro', slug: 'smart-watch-pro', description: 'Advanced smartwatch with health monitoring, GPS tracking, and 7-day battery life.', shortDescription: 'Health tracking smartwatch', price: 15999, compareAtPrice: 19999, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'], category: categories[0]._id, tags: ['smartwatch', 'health'], sku: 'ELEC-SW-002', stock: 15, isFeatured: true, averageRating: 0, reviewCount: 0 },
    { name: 'Organic Cotton T-Shirt', slug: 'organic-cotton-tshirt', description: 'Premium organic cotton t-shirt made with sustainable practices.', shortDescription: '100% organic cotton comfort', price: 1299, compareAtPrice: 1999, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'], category: categories[1]._id, tags: ['organic', 'cotton'], sku: 'CLO-TS-001', stock: 50, isFeatured: true, averageRating: 0, reviewCount: 0 },
    { name: 'Denim Jacket Classic', slug: 'denim-jacket-classic', description: 'Timeless denim jacket crafted from premium selvedge denim.', shortDescription: 'Classic selvedge denim jacket', price: 4499, images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600'], category: categories[1]._id, tags: ['denim', 'jacket'], sku: 'CLO-DJ-002', stock: 12, averageRating: 0, reviewCount: 0 },
    { name: 'Ceramic Pour-Over Coffee Set', slug: 'ceramic-pour-over-coffee-set', description: 'Handcrafted ceramic pour-over coffee maker with matching mug.', shortDescription: 'Handcrafted ceramic coffee maker', price: 3499, compareAtPrice: 4999, images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'], category: categories[2]._id, tags: ['coffee', 'ceramic'], sku: 'HK-CF-001', stock: 8, isFeatured: true, averageRating: 0, reviewCount: 0 },
    { name: 'Bamboo Cutting Board Set', slug: 'bamboo-cutting-board-set', description: 'Set of 3 premium bamboo cutting boards. Naturally antimicrobial.', shortDescription: 'Eco-friendly bamboo boards', price: 2199, images: ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600'], category: categories[2]._id, tags: ['bamboo', 'kitchen'], sku: 'HK-CB-002', stock: 30, averageRating: 0, reviewCount: 0 },
    { name: 'The Art of Clean Code', slug: 'the-art-of-clean-code', description: 'A comprehensive guide to writing maintainable, scalable software.', shortDescription: 'Master clean coding practices', price: 899, compareAtPrice: 1299, images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'], category: categories[3]._id, tags: ['programming'], sku: 'BK-CC-001', stock: 100, isFeatured: true, averageRating: 0, reviewCount: 0 },
    { name: 'Yoga Mat Premium', slug: 'yoga-mat-premium', description: 'Extra-thick 6mm yoga mat with alignment lines. Non-slip surface.', shortDescription: 'Eco-friendly non-slip yoga mat', price: 2999, compareAtPrice: 3999, images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600'], category: categories[4]._id, tags: ['yoga', 'fitness'], sku: 'SP-YM-001', stock: 20, isFeatured: true, averageRating: 0, reviewCount: 0 },
    { name: 'Portable Bluetooth Speaker', slug: 'portable-bluetooth-speaker', description: 'Waterproof portable speaker with 360-degree sound. 12-hour battery.', shortDescription: 'Waterproof 360° sound speaker', price: 4999, compareAtPrice: 6999, images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600'], category: categories[0]._id, tags: ['speaker', 'bluetooth'], sku: 'ELEC-BS-003', stock: 18, averageRating: 0, reviewCount: 0 },
    { name: 'Leather Crossbody Bag', slug: 'leather-crossbody-bag', description: 'Genuine leather crossbody bag with adjustable strap.', shortDescription: 'Genuine leather with RFID protection', price: 5999, compareAtPrice: 7999, images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600'], category: categories[1]._id, tags: ['leather', 'bag'], sku: 'CLO-LB-003', stock: 7, isFeatured: true, averageRating: 0, reviewCount: 0 },
  ]);
  console.log(`${products.length} products seeded`);

  // Update category counts
  for (const cat of categories) {
    const count = await Product.countDocuments({ category: cat._id, isActive: true });
    await Category.findByIdAndUpdate(cat._id, { productCount: count });
  }

  // ─── Users ───
  const adminExists = await User.findOne({ email: 'admin@kinmel.com' });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      email: 'admin@kinmel.com',
      password: 'Admin123',
      role: 'admin',
    });
  }
  console.log('Admin: admin@kinmel.com / Admin123');

  const customers = [];
  const customerData = [
    { name: 'Sujeet Dangol', email: 'sujeet@kinmel.com', password: 'Test1234' },
    { name: 'Rina Shrestha', email: 'rina@kinmel.com', password: 'Test1234' },
    { name: 'Bikash Tamang', email: 'bikash@kinmel.com', password: 'Test1234' },
    { name: 'Anita Gurung', email: 'anita@kinmel.com', password: 'Test1234' },
    { name: 'Ram Thapa', email: 'ram@kinmel.com', password: 'Test1234' },
  ];
  for (const cd of customerData) {
    const existing = await User.findOne({ email: cd.email });
    customers.push(existing ?? await User.create({ ...cd, role: 'customer' }));
  }
  console.log(`${customers.length} customers seeded`);

  // ─── Orders (spread across last 45 days) ───
  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const paymentMethods = ['cod', 'esewa', 'khalti', 'cod', 'esewa', 'cod'];
  const shippingAddress = {
    fullName: 'Test Customer',
    phone: '9841234567',
    street: 'Thamel, Kathmandu',
    city: 'Kathmandu',
    state: 'Bagmati',
    postalCode: '44600',
    country: 'Nepal',
  };

  const orders = [];
  for (let i = 0; i < 35; i++) {
    const customer = customers[i % customers.length];
    const status = statuses[i % statuses.length];
    const numItems = 1 + Math.floor(Math.random() * 3);
    const selectedProducts = [...products].sort(() => Math.random() - 0.5).slice(0, numItems);
    const items = selectedProducts.map((p) => ({
      product: p._id,
      name: p.name,
      price: p.price,
      quantity: 1 + Math.floor(Math.random() * 2),
      image: p.images[0] || '',
      sku: p.sku,
    }));
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const shippingCost = subtotal >= 5000 ? 0 : 150;
    const taxAmount = Math.round(subtotal * 0.13);
    const totalAmount = subtotal + shippingCost + taxAmount;
    const createdAt = randomDate(45);
    const pm = paymentMethods[i % paymentMethods.length];
    const paymentStatus = status === 'cancelled' ? 'failed' : pm === 'cod' && status !== 'delivered' ? 'pending' : 'paid';

    const deliveryUpdates = [{ status: 'pending', message: 'Order placed', timestamp: createdAt }];
    if (['confirmed', 'processing', 'shipped', 'delivered'].includes(status)) {
      deliveryUpdates.push({ status: 'confirmed', message: 'Order confirmed', timestamp: new Date(createdAt.getTime() + 3600000) });
    }
    if (['processing', 'shipped', 'delivered'].includes(status)) {
      deliveryUpdates.push({ status: 'processing', message: 'Preparing your order', timestamp: new Date(createdAt.getTime() + 7200000) });
    }
    if (['shipped', 'delivered'].includes(status)) {
      deliveryUpdates.push({ status: 'shipped', message: 'On the way', timestamp: new Date(createdAt.getTime() + 86400000) });
    }
    if (status === 'delivered') {
      deliveryUpdates.push({ status: 'delivered', message: 'Delivered successfully', timestamp: new Date(createdAt.getTime() + 172800000) });
    }

    orders.push({
      orderNumber: orderNumber(),
      user: customer._id,
      items,
      shippingAddress: { ...shippingAddress, fullName: customer.name },
      subtotal,
      shippingCost,
      taxRate: 0.13,
      taxAmount,
      totalAmount,
      status,
      paymentStatus,
      paymentMethod: pm,
      deliveryUpdates,
      createdAt,
      updatedAt: createdAt,
      ...(status === 'delivered' ? { deliveredAt: new Date(createdAt.getTime() + 172800000) } : {}),
      ...(status === 'cancelled' ? { cancelledAt: new Date(createdAt.getTime() + 3600000), cancelReason: 'Changed my mind' } : {}),
    });
  }

  const insertedOrders = await Order.insertMany(orders);
  console.log(`${insertedOrders.length} orders seeded`);

  // ─── Reviews (only for delivered orders) ───
  const deliveredOrders = insertedOrders.filter((o) => o.status === 'delivered');
  const reviewTitles = [
    'Great product!', 'Exceeded expectations', 'Good value for money',
    'Decent quality', 'Amazing!', 'Very satisfied',
  ];
  const reviewContents = [
    'Really happy with this purchase. The quality is excellent and it arrived on time.',
    'This product exceeded my expectations. Would definitely recommend to others.',
    'Good value for the price. Works as described.',
    'Decent product overall. Nothing extraordinary but gets the job done.',
    'Absolutely love it! Best purchase I have made in a long time.',
    'Very satisfied with the quality and fast delivery.',
  ];
  const verificationStatuses = ['verified', 'stored', 'verified', 'verified', 'stored', 'failed'];

  const reviews: Partial<IReview>[] = [];
  for (let i = 0; i < deliveredOrders.length; i++) {
    const order = deliveredOrders[i];
    const item = order.items[0];
    const rating = 3 + Math.floor(Math.random() * 3); // 3-5

    reviews.push({
      user: order.user,
      product: item.product,
      order: order._id,
      rating,
      title: reviewTitles[i % reviewTitles.length],
      content: reviewContents[i % reviewContents.length],
      isVerified: false,
      verificationStatus: VERIFICATION_STATUSES.PENDING,
      isFlagged: false,
      createdAt: new Date(order.createdAt.getTime() + 259200000), // 3 days after order
    });
  }

  if (reviews.length > 0) {
    const insertedReviews = (await Review.insertMany(reviews)) as IReview[];
    console.log(`${insertedReviews.length} reviews seeded`);

    for (const [index, review] of insertedReviews.entries()) {
      const requestedStatus = verificationStatuses[index % verificationStatuses.length];

      if (requestedStatus === VERIFICATION_STATUSES.FAILED) {
        review.verificationStatus = VERIFICATION_STATUSES.FAILED;
        review.verificationMessage =
          'This demo review is intentionally stored without external proof.';
        await review.save();
        continue;
      }

      const payload: ReviewPayload = {
        rating: review.rating,
        title: review.title,
        content: review.content,
        productId: review.product.toString(),
        orderId: review.order.toString(),
        userId: review.user.toString(),
        timestamp: review.createdAt.toISOString(),
      };

      const ipfsResult = await pinReviewToIPFS(payload);
      review.ipfsHash = ipfsResult.ipfsHash ?? undefined;
      review.contentHash = ipfsResult.contentHash;
      review.verificationStatus = ipfsResult.stored
        ? VERIFICATION_STATUSES.STORED
        : VERIFICATION_STATUSES.FAILED;
      review.verificationMessage = ipfsResult.reason ?? null;
      await review.save();

      if (
        requestedStatus === VERIFICATION_STATUSES.VERIFIED &&
        ipfsResult.stored &&
        ipfsResult.ipfsHash &&
        isBlockchainConfigured()
      ) {
        try {
          const anchored = await anchorReviewOnChain({
            reviewId: review._id.toString(),
            contentHash: ipfsResult.contentHash,
            ipfsCid: ipfsResult.ipfsHash,
            productId: review.product.toString(),
            orderId: review.order.toString(),
            userId: review.user.toString(),
          });

          review.blockchainTxHash = anchored.txHash;
          review.blockNumber = anchored.blockNumber;
          review.contractAddress = anchored.contractAddress;
          review.isVerified = true;
          review.verificationStatus = VERIFICATION_STATUSES.VERIFIED;
          review.verificationMessage = null;
          await review.save();
        } catch (error) {
          review.verificationMessage =
            'Stored successfully, but blockchain anchoring was unavailable during seeding.';
          await review.save();
          console.warn(
            `Skipping blockchain seed proof for review ${review._id}:`,
            (error as Error).message
          );
        }
      }
    }

    // Update product review counts and averages
    const productReviewMap = new Map<string, { total: number; sum: number }>();
    for (const r of insertedReviews) {
      const pid = r.product.toString();
      const entry = productReviewMap.get(pid) || { total: 0, sum: 0 };
      entry.total++;
      entry.sum += r.rating;
      productReviewMap.set(pid, entry);
    }
    for (const [pid, { total, sum }] of productReviewMap) {
      await Product.findByIdAndUpdate(pid, {
        reviewCount: total,
        averageRating: Math.round((sum / total) * 10) / 10,
      });
    }
    console.log('Product review stats updated');
  }

  await mongoose.disconnect();
  console.log('\nSeed complete!');
  console.log('\nLogin credentials:');
  console.log('  Admin: admin@kinmel.com / Admin123');
  console.log('  Customer: sujeet@kinmel.com / Test1234');
}

seed().catch(console.error);
