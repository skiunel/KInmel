// ─── Route Paths ───

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  products: '/products',
  product: (slug: string) => `/products/${slug}`,
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
  order: (id: string) => `/orders/${id}`,
  orderConfirmation: (id: string) => `/orders/confirmation/${id}`,
  writeReview: (orderId: string, productId: string) =>
    `/orders/${orderId}/review/${productId}`,
  verify: (reviewId: string) => `/verify/${reviewId}`,
  account: '/account',
  profile: '/account',

  // Admin
  adminLogin: '/admin/login',
  admin: '/admin',
  adminProducts: '/admin/products',
  adminProductNew: '/admin/products/new',
  adminProductEdit: (id: string) => `/admin/products/${id}/edit`,
  adminOrders: '/admin/orders',
  adminOrder: (id: string) => `/admin/orders/${id}`,
  adminUsers: '/admin/users',
  adminReviews: '/admin/reviews',
  adminSettings: '/admin/settings',
} as const;

// ─── Order Status Pipeline ───

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
};

// ─── Pagination ───

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

// ─── Cart ───

export const MAX_CART_ITEM_QUANTITY = 10;

// ─── Currency ───

export const CURRENCY = 'Rs.';
export const TAX_RATE = 0.13;
export const FREE_SHIPPING_THRESHOLD = 5000;
export const SHIPPING_COST = 150;
