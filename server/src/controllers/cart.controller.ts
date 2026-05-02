import { Request, Response } from 'express';
import * as cartService from '../services/cart.service';
import { asyncHandler } from '../utils/async-handler';

// ─── GET /cart ───

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.getCart(req.user!.id);

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// ─── POST /cart/items ───

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.addToCart(req.user!.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: cart,
  });
});

// ─── PUT /cart/items/:productId ───

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.updateItem(
    req.user!.id,
    req.params.productId as string,
    req.body
  );

  res.status(200).json({
    success: true,
    message: 'Cart updated',
    data: cart,
  });
});

// ─── DELETE /cart/items/:productId ───

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.removeItem(
    req.user!.id,
    req.params.productId as string
  );

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: cart,
  });
});

// ─── DELETE /cart ───

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.clearCart(req.user!.id);

  res.status(200).json({
    success: true,
    message: 'Cart cleared',
    data: cart,
  });
});
