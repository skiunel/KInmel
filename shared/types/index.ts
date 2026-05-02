// ============================================
// Kinmel — Shared Type Definitions
// ============================================

// ---------- User ----------
export type UserRole = 'customer' | 'admin';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPublic {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

// ---------- Auth ----------
export interface ITokenPayload {
  userId: string;
  role: UserRole;
}

export interface IAuthResponse {
  user: IUserPublic;
  accessToken: string;
}

// ---------- Product ----------
export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  stock: number;
  sku: string;
  isActive: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Cart ----------
export interface ICartItem {
  product: string | IProduct;
  quantity: number;
  price: number;
}

export interface ICart {
  _id: string;
  user: string;
  items: ICartItem[];
  totalAmount: number;
}

// ---------- Order ----------
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

export interface IShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrderItem {
  product: string | IProduct;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface IDeliveryUpdate {
  status: OrderStatus;
  message: string;
  timestamp: Date;
  location?: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  user: string | IUser;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  deliveryUpdates: IDeliveryUpdate[];
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Review ----------
export interface IReview {
  _id: string;
  user: string | IUserPublic;
  product: string | IProduct;
  order: string;
  rating: number;
  title: string;
  content: string;
  ipfsHash: string;
  blockchainTxHash: string;
  blockNumber?: number;
  contractAddress?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewProof {
  reviewer: string;
  productId: string;
  orderId: string;
  ipfsHash: string;
  contentHash: string;
  timestamp: number;
  txHash: string;
  blockNumber: number;
}

// ---------- API Response ----------
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
