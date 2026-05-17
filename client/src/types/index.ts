// Re-export shared types and add client-specific types

// ─── API Response ───

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
  errors?: Array<{ field: string; message: string }>;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── Auth ───

export type UserRole = 'customer' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  phone?: string | null;
  isEmailVerified?: boolean;
  emailVerifiedAt?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

// ─── Category ───

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  displayOrder: number;
  productCount: number;
}

// ─── Product ───

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  category: Category | string;
  tags: string[];
  sku: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Cart ───

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}

// ─── Order ───

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  sku: string;
}

export interface DeliveryUpdate {
  _id: string;
  status: OrderStatus;
  message: string;
  location?: string | null;
  updatedBy?: { _id: string; name: string } | null;
  timestamp: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingCost: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  notes?: string;
  deliveryUpdates?: DeliveryUpdate[];
  estimatedDelivery?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  blockchainCode?: string | null;
  blockchainTxHash?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Review ───

export type VerificationStatus = 'pending' | 'stored' | 'verified' | 'failed';

export interface Review {
  _id: string;
  user: Pick<User, '_id' | 'name' | 'avatar'>;
  product: Pick<Product, '_id' | 'name' | 'slug'> | string;
  order: string;
  rating: number;
  title: string;
  content: string;
  ipfsHash?: string | null;
  blockchainTxHash?: string | null;
  blockNumber?: number | null;
  contractAddress?: string | null;
  contentHash?: string | null;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationMessage?: string | null;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewEligibility {
  productId: string;
  name: string;
  image: string;
  eligible: boolean;
  reason: string;
  existingReview?: Pick<Review, '_id' | 'rating' | 'title'>;
}

// ─── Verification ───

export interface VerificationCheck {
  passed: boolean | null;
  description: string;
}

export interface VerificationResult {
  reviewId: string;
  review: Pick<Review, 'rating' | 'title' | 'content' | 'createdAt'> & {
    user: { name: string };
    product: { name: string; slug: string };
  };
  ipfs: {
    hash: string;
    gatewayUrl: string;
    contentAvailable: boolean;
    contentMatch: boolean;
  };
  blockchain: {
    txHash: string;
    blockNumber: number;
    contractAddress: string;
    networkId: number;
    proofExists: boolean;
  };
  checks: {
    contentIntegrity: VerificationCheck;
    hashIntegrity: VerificationCheck;
    proofExists: VerificationCheck;
    buyerVerified: VerificationCheck;
    timestampValid: VerificationCheck;
  };
  overallVerified: boolean;
  checksPassedCount: number;
  checksTotalCount: number;
}

// ─── Dashboard ───

export interface DashboardStats {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    pendingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalReviews: number;
    verifiedReviews: number;
  };
  trends: {
    revenueChange: number;
    ordersChange: number;
    usersChange: number;
  };
  charts: {
    revenueChart: Array<{ date: string; revenue: number; orders: number }>;
    ordersByStatus: Array<{ name: string; value: number; status: string }>;
    topProducts: Array<{ name: string; sold: number; revenue: number }>;
    paymentMethods: Array<{ method: string; count: number; revenue: number }>;
    blockchainStats: {
      verified: number;
      stored: number;
      failed: number;
      pending: number;
    };
  };
  recentOrders: Order[];
}
