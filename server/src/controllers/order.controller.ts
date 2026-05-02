import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { initializeEsewaPayment, verifyEsewaPayment } from '../services/esewa.service';
import { Order } from '../models/Order';
import { asyncHandler } from '../utils/async-handler';
import { PAYMENT_STATUSES } from '../config/constants';

// ─── POST /orders/checkout ───

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.placeOrder(req.user!.id, req.body);

  // If eSewa or Khalti, return payment initialization data
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

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: order,
  });
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
