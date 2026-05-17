import { Order } from '../models/Order';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Review } from '../models/Review';
import { ORDER_STATUSES, VERIFICATION_STATUSES } from '../config/constants';

export async function getDashboardStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    totalUsers,
    totalProducts,
    totalReviews,
    verifiedReviews,
    storedReviews,
    failedReviews,
    revenueAgg,
    recentOrders,
    ordersThisPeriod,
    ordersLastPeriod,
    usersThisPeriod,
    usersLastPeriod,
    revenueThisPeriod,
    revenueLastPeriod,
    // Charts: daily revenue for last 30 days
    dailyRevenue,
    // Charts: order status breakdown
    orderStatusBreakdown,
    // Top selling products
    topProducts,
    // Payment method breakdown
    paymentMethodBreakdown,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: ORDER_STATUSES.PENDING }),
    Order.countDocuments({ status: ORDER_STATUSES.DELIVERED }),
    Order.countDocuments({ status: ORDER_STATUSES.CANCELLED }),
    User.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Review.countDocuments(),
    Review.countDocuments({ verificationStatus: VERIFICATION_STATUSES.VERIFIED }),
    Review.countDocuments({ verificationStatus: VERIFICATION_STATUSES.STORED }),
    Review.countDocuments({ verificationStatus: VERIFICATION_STATUSES.FAILED }),
    Order.aggregate([
      { $match: { status: { $ne: ORDER_STATUSES.CANCELLED } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .lean(),
    // Trends
    Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Order.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    User.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: ORDER_STATUSES.CANCELLED } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }, status: { $ne: ORDER_STATUSES.CANCELLED } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    // Daily revenue (last 30 days)
    Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: ORDER_STATUSES.CANCELLED } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    // Order status breakdown
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    // Top 5 selling products
    Order.aggregate([
      { $match: { status: { $ne: ORDER_STATUSES.CANCELLED } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]),
    // Payment method breakdown
    Order.aggregate([
      { $match: { status: { $ne: ORDER_STATUSES.CANCELLED } } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    ]),
  ]);

  const totalRevenue = revenueAgg[0]?.total ?? 0;
  const revThis = (revenueThisPeriod[0]?.total as number) ?? 0;
  const revLast = (revenueLastPeriod[0]?.total as number) ?? 0;

  function pctChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  // Fill in missing days for chart continuity
  const revenueChart: Array<{ date: string; revenue: number; orders: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const existing = dailyRevenue.find((r: { _id: string }) => r._id === dateStr);
    revenueChart.push({
      date: dateStr,
      revenue: (existing?.revenue as number) ?? 0,
      orders: (existing?.orders as number) ?? 0,
    });
  }

  // Format order status for pie chart
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  const ordersByStatus = orderStatusBreakdown.map((s: { _id: string; count: number }) => ({
    name: statusMap[s._id] || s._id,
    value: s.count,
    status: s._id,
  }));

  return {
    stats: {
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalReviews,
      verifiedReviews,
    },
    trends: {
      revenueChange: pctChange(revThis, revLast),
      ordersChange: pctChange(ordersThisPeriod, ordersLastPeriod),
      usersChange: pctChange(usersThisPeriod, usersLastPeriod),
    },
    charts: {
      revenueChart,
      ordersByStatus,
      topProducts: topProducts.map((p: { name: string; totalSold: number; totalRevenue: number }) => ({
        name: p.name,
        sold: p.totalSold,
        revenue: p.totalRevenue,
      })),
      paymentMethods: paymentMethodBreakdown.map((p: { _id: string; count: number; revenue: number }) => ({
        method: p._id === 'cod' ? 'Cash on Delivery' : p._id === 'esewa' ? 'eSewa' : p._id === 'khalti' ? 'Khalti' : p._id,
        count: p.count,
        revenue: p.revenue,
      })),
      blockchainStats: {
        verified: verifiedReviews,
        stored: storedReviews,
        failed: failedReviews,
        pending: totalReviews - verifiedReviews - storedReviews - failedReviews,
      },
    },
    recentOrders,
  };
}

export async function getAdminUsers(query: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  const { page = 1, limit = 20, search, role } = query;
  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}
