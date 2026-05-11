import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { initializeEsewaPayment, verifyEsewaPayment } from '../services/esewa.service';
import {
  createCheckoutSession,
  verifyWebhookSignature,
  isStripeConfigured,
} from '../services/stripe.service';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { asyncHandler } from '../utils/async-handler';
import { PAYMENT_STATUSES } from '../config/constants';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// ─── POST /orders/checkout ───

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.placeOrder(req.user!.id, req.body);

  if (req.body.paymentMethod === 'esewa') {
    const esewaData = initializeEsewaPayment({
      orderId: order._id.toString(),
      totalAmount: order.totalAmount,
      taxAmount: order.taxAmount,
      productDeliveryCharge: order.shippingCost,
      productServiceCharge: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed — redirecting to eSewa',
      data: order,
      payment: esewaData,
    });
    return;
  }

  if (req.body.paymentMethod === 'stripe') {
    if (!isStripeConfigured()) {
      res.status(503).json({
        success: false,
        message: 'Stripe is not configured on this server',
      });
      return;
    }

    const orderId = order._id.toString();
    const stripeSuccessUrl = new URL('/orders/payment/stripe/success', env.CLIENT_URL);
    const stripeCancelUrl = new URL('/orders/payment/stripe/failure', env.CLIENT_URL);
    stripeSuccessUrl.searchParams.set('order_id', orderId);
    stripeCancelUrl.searchParams.set('order_id', orderId);

    const user = await User.findById(req.user!.id).select('email');

    const session = await createCheckoutSession({
      orderId,
      totalAmount: order.totalAmount,
      currency: 'usd',
      successUrl: stripeSuccessUrl.toString(),
      cancelUrl: stripeCancelUrl.toString(),
      customerEmail: user?.email,
      items: order.items.map((item) => ({
        name:
          typeof item.product === 'object'
            ? (item.product as { name?: string }).name ?? 'Product'
            : 'Product',
        amount: item.price,
        quantity: item.quantity,
      })),
    });

    res.status(201).json({
      success: true,
      message: 'Order placed - redirecting to Stripe',
      data: order,
      payment: {
        redirectUrl: session.url,
        sessionId: session.id,
      },
    });
    return;
  }

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: order,
  });
});

// ─── POST /orders/stripe/webhook (raw body) ───

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string | undefined;
  // Raw body is required for signature verification
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody ?? req.body;

  const event = verifyWebhookSignature(rawBody, sig);
  if (!event) {
    res.status(400).json({ success: false, message: 'Invalid Stripe signature' });
    return;
  }

  logger.info(`Stripe webhook: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as {
      id: string;
      client_reference_id?: string;
      metadata?: { orderId?: string };
      payment_status?: string;
    };
    const orderId = session.metadata?.orderId ?? session.client_reference_id;
    if (orderId && session.payment_status === 'paid') {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = PAYMENT_STATUSES.PAID;
        order.deliveryUpdates.push({
          status: order.status,
          message: `Stripe payment confirmed (session: ${session.id})`,
          timestamp: new Date(),
        });
        await order.save();
      }
    }
  }

  res.status(200).json({ received: true });
});

// ─── POST /orders/esewa/verify ───

export const verifyEsewa = asyncHandler(async (req: Request, res: Response) => {
  const { data: encodedData } = req.body;

  if (!encodedData) {
    res.status(400).json({ success: false, message: 'Missing eSewa payment data' });
    return;
  }

  const result = await verifyEsewaPayment(encodedData);

  if (!result.success || !result.orderId) {
    res.status(400).json({
      success: false,
      message: 'Payment verification failed',
      data: result,
    });
    return;
  }

  // Update order payment status
  const order = await Order.findById(result.orderId);
  if (order) {
    order.paymentStatus = PAYMENT_STATUSES.PAID;
    order.deliveryUpdates.push({
      status: order.status,
      message: `eSewa payment confirmed (TX: ${result.transactionCode})`,
      timestamp: new Date(),
    });
    await order.save();
  }

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    data: { orderId: result.orderId, transactionCode: result.transactionCode },
  });
});

// ─── GET /orders ───

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.getMyOrders(req.user!.id, req.query as never);

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

// ─── GET /orders/:id ───

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(
    req.params.id as string,
    req.user!.id,
    req.user!.role === 'admin'
  );

  res.status(200).json({
    success: true,
    data: order,
  });
});

// ─── POST /orders/:id/cancel ───

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.cancelOrder(
    req.params.id as string,
    req.user!.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order,
  });
});

// ─── PUT /admin/orders/:id/status (Admin) ───

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderStatus(
    req.params.id as string,
    req.body
  );

  res.status(200).json({
    success: true,
    message: 'Order status updated',
    data: order,
  });
});

// ─── GET /admin/orders (Admin) ───

export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.getAllOrders(req.query as never);

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});
