import mongoose from 'mongoose';
import crypto from 'crypto';
import { Order, type IOrder } from '../models/Order';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { ApiError } from '../utils/api-error';
import {
  TAX_RATE,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from '../config/constants';
import type {
  CheckoutInput,
  UpdateOrderStatusInput,
  CancelOrderInput,
  OrderQueryInput,
} from '../validators/order.validators';

// ─── Place Order (Checkout) ───

export const placeOrder = async (
  userId: string,
  input: CheckoutInput
): Promise<IOrder> => {
  // 1. Get user's cart with populated products
  const cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name slug price images stock isActive sku',
  });

  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Your cart is empty');
  }

  // 2. Validate all items and build order items
  const orderItems: Array<{
    product: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image: string;
    sku: string;
  }> = [];

  const stockUpdates: Array<{ id: mongoose.Types.ObjectId; decrement: number }> = [];

  for (const cartItem of cart.items) {
    const product = cartItem.product as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      slug: string;
      price: number;
      images: string[];
      stock: number;
      isActive: boolean;
      sku: string;
    };

    if (!product || !product.isActive) {
      throw ApiError.badRequest(
        `Product "${product?.name || 'Unknown'}" is no longer available. Please remove it from your cart.`
      );
    }

    if (product.stock < cartItem.quantity) {
      throw ApiError.badRequest(
        `Only ${product.stock} unit(s) of "${product.name}" available, but you have ${cartItem.quantity} in cart.`
      );
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: cartItem.quantity,
      image: product.images[0] || '',
      sku: product.sku,
    });

    stockUpdates.push({ id: product._id, decrement: cartItem.quantity });
  }

  // 3. Calculate totals using current prices
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const taxAmount = Math.round(subtotal * TAX_RATE);
  const totalAmount = subtotal + shippingCost + taxAmount;

  // 4. Generate order number
  const orderNumber = await generateOrderNumber();

  // 5. Create order + decrement stock + clear cart
  // Try transaction first (replica set), fall back to non-transactional for standalone MongoDB
  let order: IOrder;

  const orderData = {
    orderNumber,
    user: userId,
    items: orderItems,
    shippingAddress: input.shippingAddress,
    subtotal,
    shippingCost,
    taxRate: TAX_RATE,
    taxAmount,
    totalAmount,
    paymentMethod: input.paymentMethod,
    notes: input.notes,
    status: ORDER_STATUSES.PENDING,
    paymentStatus: PAYMENT_STATUSES.PENDING,
    deliveryUpdates: [
      {
        status: ORDER_STATUSES.PENDING,
        message: 'Order placed successfully',
        timestamp: new Date(),
      },
    ],
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  try {
    // Try with transaction (requires replica set)
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        for (const { id, decrement } of stockUpdates) {
          const result = await Product.findOneAndUpdate(
            { _id: id, stock: { $gte: decrement } },
            { $inc: { stock: -decrement } },
            { session, new: true }
          );
          if (!result) {
            throw ApiError.badRequest(
              'Stock changed during checkout. Please review your cart and try again.'
            );
          }
        }
        const [created] = await Order.create([orderData], { session });
        order = created;
        cart.items = [];
        await cart.save({ session });
      });
    } finally {
      await session.endSession();
    }
  } catch (err: unknown) {
    // Fallback: standalone MongoDB (no replica set) — run without transaction
    const isTransactionError =
      err instanceof Error &&
      (err.message.includes('Transaction') || err.message.includes('transaction'));
    if (!isTransactionError) throw err;

    for (const { id, decrement } of stockUpdates) {
      const result = await Product.findOneAndUpdate(
        { _id: id, stock: { $gte: decrement } },
        { $inc: { stock: -decrement } },
        { new: true }
      );
      if (!result) {
        throw ApiError.badRequest(
          'Stock changed during checkout. Please review your cart and try again.'
        );
      }
    }
    order = await Order.create(orderData);
    cart.items = [];
    await cart.save();
  }

  return order!;
};

// ─── Get My Orders ───

export const getMyOrders = async (
  userId: string,
  query: OrderQueryInput
) => {
  const { page, limit, status, sort } = query;

  const filter: Record<string, unknown> = { user: userId };
  if (status) filter.status = status;

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    total_asc: { totalAmount: 1 },
    total_desc: { totalAmount: -1 },
  };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return {
    data: orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

// ─── Get Single Order ───

export const getOrderById = async (
  orderId: string,
  userId: string,
  isAdmin: boolean
): Promise<IOrder> => {
  const filter: Record<string, unknown> = { _id: orderId };
  if (!isAdmin) filter.user = userId;

  const order = await Order.findOne(filter).populate('user', 'name email');
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  return order;
};

// ─── Cancel Order (Customer) ───

export const cancelOrder = async (
  orderId: string,
  userId: string,
  input: CancelOrderInput
): Promise<IOrder> => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  const cancellable: string[] = [ORDER_STATUSES.PENDING, ORDER_STATUSES.CONFIRMED];
  if (!cancellable.includes(order.status)) {
    throw ApiError.badRequest(
      'Order can only be cancelled when it is pending or confirmed'
    );
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  order.status = ORDER_STATUSES.CANCELLED;
  order.cancelledAt = new Date();
  order.cancelReason = input.reason;
  order.deliveryUpdates.push({
    status: ORDER_STATUSES.CANCELLED,
    message: `Cancelled by customer: ${input.reason}`,
    timestamp: new Date(),
  });

  await order.save();
  return order;
};

// ─── Update Order Status (Admin) ───

export const updateOrderStatus = async (
  orderId: string,
  input: UpdateOrderStatusInput
): Promise<IOrder> => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.status === ORDER_STATUSES.CANCELLED) {
    throw ApiError.badRequest('Cannot update a cancelled order');
  }

  if (order.status === ORDER_STATUSES.DELIVERED) {
    throw ApiError.badRequest('Cannot update a delivered order');
  }

  order.status = input.status;

  // Mark delivered — generate a delivery confirmation code for review eligibility
  if (input.status === ORDER_STATUSES.DELIVERED) {
    order.deliveredAt = new Date();
    order.paymentStatus = PAYMENT_STATUSES.PAID; // COD paid on delivery

    // Generate delivery confirmation code (SDC = Secure Delivery Code)
    const sdcPayload = `${order._id}:${order.orderNumber}:${order.user}:${Date.now()}`;
    const sdcHash = crypto.createHash('sha256').update(sdcPayload).digest('hex');
    order.blockchainCode = `SDC-${sdcHash.substring(0, 16).toUpperCase()}`;
  }

  // Mark cancelled by admin → restore stock
  if (input.status === ORDER_STATUSES.CANCELLED) {
    order.cancelledAt = new Date();
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
  }

  order.deliveryUpdates.push({
    status: input.status,
    message: input.message || `Order status updated to ${input.status}`,
    location: input.location,
    timestamp: new Date(),
  });

  await order.save();
  return order;
};

// ─── Admin: Get All Orders ───

export const getAllOrders = async (query: OrderQueryInput) => {
  const { page, limit, status, sort } = query;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    total_asc: { totalAmount: 1 },
    total_desc: { totalAmount: -1 },
  };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return {
    data: orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

// ─── Helpers ───

async function generateOrderNumber(): Promise<string> {
  const date = new Date();
  const prefix = `KNM-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const count = await Order.countDocuments({
    orderNumber: { $regex: `^${prefix}` },
  });
  return `${prefix}-${String(count + 1).padStart(5, '0')}`;
}
