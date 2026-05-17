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
    // ─── Electronics ───
    { name: 'Meta Quest 3 VR Headset', slug: 'meta-quest-3-vr', description: 'Mixed-reality VR headset with 4K display, hand tracking, and 128GB storage. Standalone — no PC required.', shortDescription: 'Standalone 4K mixed-reality VR', price: 54999, compareAtPrice: 64999, images: ['https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800', 'https://images.unsplash.com/photo-1626387346567-68d0c4f3b8d7?w=800'], category: categories[0]._id, tags: ['vr', 'mixed-reality'], sku: 'ELEC-VR-001', stock: 8, isFeatured: true, averageRating: 0, reviewCount: 0 },
    { name: 'VR Gaming Bundle', slug: 'vr-gaming-bundle', description: 'Entry-level VR headset bundled with two motion controllers and a charging dock. Compatible with PC.', shortDescription: 'PC-VR headset + controllers', price: 18999, compareAtPrice: 24999, images: ['https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=800', 'https://images.unsplash.com/photo-1605457212940-2eb4f3208063?w=800'], category: categories[0]._id, tags: ['vr', 'gaming'], sku: 'ELEC-VR-002', stock: 14, isFeatured: true, averageRating: 0, reviewCount: 0 },
    { name: 'Wireless Earbuds Lite', slug: 'wireless-earbuds-lite', description: 'Compact true wireless earbuds with 20-hour total playback and IPX4 sweat resistance.', shortDescription: 'Budget true-wireless earbuds', price: 1499, compareAtPrice: 2299, images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800'], category: categories[0]._id, tags: ['audio', 'wireless'], sku: 'ELEC-WE-001', stock: 80, isFeatured: true, averageRating: 0, reviewCount: 0 },
    { name: 'Premium Wireless Headphones', slug: 'premium-wireless-headphones', description: 'High-fidelity over-ear headphones with active noise cancellation and 30-hour battery.', shortDescription: 'ANC over-ear, 30h battery', price: 8999, compareAtPrice: 12999, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800'], category: categories[0]._id, tags: ['wireless', 'audio'], sku: 'ELEC-WH-001', stock: 25, isFeatured: true, averageRating: 0, reviewCount: 0 },
    { name: 'Smart Watch Pro', slug: 'smart-watch-pro', description: 'Health-tracking smartwatch with GPS, SpO2, ECG and 7-day battery life.', shortDescription: 'Health smartwatch, 7-day battery', price: 15999, compareAtPrice: 19999, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800'], category: categories[0]._id, tags: ['smartwatch', 'health'], sku: 'ELEC-SW-002', stock: 15, isFeatured: true, averageRating: 0, reviewCount: 0 },
    { name: 'Smart Band Basic', slug: 'smart-band-basic', description: 'Fitness band with heart-rate, sleep tracking and 14-day battery.', shortDescription: 'Cheap fitness band, 14d battery', price: 1299, compareAtPrice: 1799, images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800'], category: categories[0]._id, tags: ['fitness'], sku: 'ELEC-SB-001', stock: 60, averageRating: 0, reviewCount: 0 },
    { name: 'Portable Bluetooth Speaker', slug: 'portable-bluetooth-speaker', description: 'IPX7 waterproof speaker with 360° sound and 12-hour battery.', shortDescription: 'Waterproof 360° speaker', price: 2499, compareAtPrice: 3499, images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800'], category: categories[0]._id, tags: ['speaker', 'bluetooth'], sku: 'ELEC-BS-003', stock: 35, averageRating: 0, reviewCount: 0 },
    { name: 'Mechanical Keyboard 75%', slug: 'mechanical-keyboard-75', description: 'Hot-swappable 75% mechanical keyboard with PBT keycaps and RGB.', shortDescription: 'Hot-swap 75% mech keyboard', price: 4999, compareAtPrice: 6499, images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800'], category: categories[0]._id, tags: ['keyboard', 'gaming'], sku: 'ELEC-KB-001', stock: 18, isFeatured: true, averageRating: 0, reviewCount: 0 },
    { name: 'Wireless Mouse Ergo', slug: 'wireless-mouse-ergo', description: 'Ergonomic wireless mouse with silent click and 70-day battery.', shortDescription: 'Silent ergo wireless mouse', price: 899, compareAtPrice: 1499, images: ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=800', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'], category: categories[0]._id, tags: ['mouse'], sku: 'ELEC-MS-001', stock: 90, averageRating: 0, reviewCount: 0 },
    { name: 'Portable Power Bank 20K', slug: 'portable-power-bank-20k', description: '20,000mAh USB-C PD power bank with 22.5W fast charging.', shortDescription: '20K mAh fast-charge bank', price: 1999, compareAtPrice: 2799, images: ['https://images.unsplash.com/photo-1609592424823-d04ec0d4a9c0?w=800', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800'], category: categories[0]._id, tags: ['charging'], sku: 'ELEC-PB-001', stock: 45, averageRating: 0, reviewCount: 0 },
    { name: 'Webcam 4K Studio', slug: 'webcam-4k-studio', description: '4K UHD webcam with auto-framing, dual mics and privacy shutter.', shortDescription: '4K UHD content-creator webcam', price: 6999, compareAtPrice: 8999, images: ['https://images.unsplash.com/photo-1622979135240-caa6648190b6?w=800', 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800'], category: categories[0]._id, tags: ['webcam', 'creator'], sku: 'ELEC-CAM-001', stock: 22, averageRating: 0, reviewCount: 0 },

    // ─── Clothing ───
    { name: 'Organic Cotton T-Shirt', slug: 'organic-cotton-tshirt', description: '100% organic combed cotton tee. GOTS certified.', shortDescription: '100% organic cotton tee', price: 799, compareAtPrice: 1199, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'], category: categories[1]._id, tags: ['organic', 'cotton'], sku: 'CLO-TS-001', stock: 80, isFeatured: true, averageRating: 0, reviewCount: 0 },
    { name: 'Heavyweight Hoodie', slug: 'heavyweight-hoodie', description: '400 gsm fleece hoodie with kangaroo pocket and ribbed cuffs.', shortDescription: 'Heavyweight fleece hoodie', price: 2499, compareAtPrice: 3499, images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800'], category: categories[1]._id, tags: ['hoodie'], sku: 'CLO-HD-001', stock: 35, averageRating: 0, reviewCount: 0 },
    { name: 'Denim Jacket Classic', slug: 'denim-jacket-classic', description: 'Selvedge denim trucker jacket in raw indigo.', shortDescription: 'Selvedge raw denim trucker', price: 4499, images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800'], category: categories[1]._id, tags: ['denim'], sku: 'CLO-DJ-002', stock: 12, averageRating: 0, reviewCount: 0 },
    { name: 'Canvas Tote Bag', slug: 'canvas-tote-bag', description: 'Heavy 16oz canvas tote with reinforced straps.', shortDescription: 'Heavy canvas everyday tote', price: 599, compareAtPrice: 899, images: ['https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800', 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800'], category: categories[1]._id, tags: ['bag', 'canvas'], sku: 'CLO-CT-001', stock: 120, averageRating: 0, reviewCount: 0 },
    { name: 'Leather Crossbody Bag', slug: 'leather-crossbody-bag', description: 'Vegetable-tanned leather crossbody with brass hardware.', shortDescription: 'Veg-tan leather crossbody', price: 5999, compareAtPrice: 7999, images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800'], category: categories[1]._id, tags: ['leather'], sku: 'CLO-LB-003', stock: 9, isFeatured: true, averageRating: 0, reviewCount: 0 },
    { name: 'Wool Beanie', slug: 'wool-beanie', description: 'Cuffed merino wool beanie. One size.', shortDescription: 'Merino wool beanie', price: 499, compareAtPrice: 799, images: ['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800', 'https://images.unsplash.com/photo-1510598969022-c4c6c5d05769?w=800'], category: categories[1]._id, tags: ['accessories'], sku: 'CLO-BN-001', stock: 70, averageRating: 0, reviewCount: 0 },

    // ─── Home & Kitchen ───
    { name: 'Ceramic Pour-Over Set', slug: 'ceramic-pour-over-set', description: 'Handcrafted ceramic dripper + carafe + mug set.', shortDescription: 'Handcrafted ceramic coffee set', price: 2499, compareAtPrice: 3999, images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800'], category: categories[2]._id, tags: ['coffee'], sku: 'HK-CF-001', stock: 12, isFeatured: true, averageRating: 0, reviewCount: 0 },
    { name: 'Bamboo Cutting Board Set', slug: 'bamboo-cutting-board-set', description: 'Set of 3 bamboo cutting boards. Naturally antimicrobial.', shortDescription: 'Eco bamboo boards × 3', price: 999, images: ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800', 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800'], category: categories[2]._id, tags: ['bamboo'], sku: 'HK-CB-002', stock: 30, averageRating: 0, reviewCount: 0 },
    { name: 'Linen Throw Blanket', slug: 'linen-throw-blanket', description: 'Stone-washed pure linen throw, 130×170cm.', shortDescription: 'Stone-washed linen throw', price: 1899, compareAtPrice: 2599, images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800'], category: categories[2]._id, tags: ['linen', 'home'], sku: 'HK-TB-001', stock: 18, averageRating: 0, reviewCount: 0 },
    { name: 'Soy Candle Trio', slug: 'soy-candle-trio', description: 'Three hand-poured soy candles in cedar, fig and bergamot.', shortDescription: 'Hand-poured soy trio', price: 1299, compareAtPrice: 1799, images: ['https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800', 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800'], category: categories[2]._id, tags: ['candle'], sku: 'HK-CN-001', stock: 40, averageRating: 0, reviewCount: 0 },

    // ─── Books ───
    { name: 'The Art of Clean Code', slug: 'the-art-of-clean-code', description: 'A guide to writing maintainable, scalable software.', shortDescription: 'Clean code practices', price: 699, compareAtPrice: 999, images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800'], category: categories[3]._id, tags: ['programming'], sku: 'BK-CC-001', stock: 100, isFeatured: true, averageRating: 0, reviewCount: 0 },
    { name: 'Pocket Notebook (Pack of 3)', slug: 'pocket-notebook-pack-3', description: 'Three A6 dot-grid notebooks with kraft cover and 64 pages.', shortDescription: '3× kraft pocket notebooks', price: 399, compareAtPrice: 599, images: ['https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800'], category: categories[3]._id, tags: ['stationery'], sku: 'BK-NB-001', stock: 200, averageRating: 0, reviewCount: 0 },

    // ─── Sports & Outdoors ───
    { name: 'Yoga Mat Premium', slug: 'yoga-mat-premium', description: '6mm TPE yoga mat with alignment lines. Non-slip both sides.', shortDescription: 'Non-slip TPE yoga mat', price: 1799, compareAtPrice: 2599, images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'], category: categories[4]._id, tags: ['yoga'], sku: 'SP-YM-001', stock: 30, isFeatured: true, averageRating: 0, reviewCount: 0 },
    { name: 'Steel Water Bottle 1L', slug: 'steel-water-bottle-1l', description: 'Insulated double-wall stainless steel bottle, 1 litre.', shortDescription: 'Insulated steel bottle 1L', price: 899, compareAtPrice: 1399, images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800', 'https://images.unsplash.com/photo-1610375229560-fd9c7c91708e?w=800'], category: categories[4]._id, tags: ['hydration'], sku: 'SP-WB-001', stock: 65, averageRating: 0, reviewCount: 0 },
    { name: 'Resistance Band Set', slug: 'resistance-band-set', description: '5-piece resistance band set with door anchor and carry pouch.', shortDescription: '5-band resistance set', price: 699, compareAtPrice: 1199, images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'], category: categories[4]._id, tags: ['fitness'], sku: 'SP-RB-001', stock: 50, averageRating: 0, reviewCount: 0 },
    { name: 'Foldable Camping Chair', slug: 'foldable-camping-chair', description: 'Compact aluminium-frame chair, holds 120kg. Carry bag included.', shortDescription: 'Compact aluminium camp chair', price: 1599, compareAtPrice: 2299, images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'https://images.unsplash.com/photo-1504280317859-0f51a32ad88e?w=800'], category: categories[4]._id, tags: ['camping'], sku: 'SP-CC-001', stock: 22, averageRating: 0, reviewCount: 0 },
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
