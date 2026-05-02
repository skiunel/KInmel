export const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

export const VERIFICATION_STATUSES = {
  PENDING: 'pending',
  STORED: 'stored',
  VERIFIED: 'verified',
  FAILED: 'failed',
} as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[keyof typeof VERIFICATION_STATUSES];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
} as const;

export const CART = {
  MAX_ITEMS: 20,
  MAX_QUANTITY_PER_ITEM: 10,
} as const;

export const TAX_RATE = 0.13; // 13% Nepal VAT
export const FREE_SHIPPING_THRESHOLD = 5000; // Rs. 5000
export const SHIPPING_COST = 150; // Rs. 150
