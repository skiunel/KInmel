import { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { asyncHandler } from '../utils/async-handler';
import type { ProductQuery } from '../validators/product.validators';

// ─── GET /products ───

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getAll(req.query as unknown as ProductQuery);

  res.status(200).json({
    success: true,
    data: result.products,
    pagination: result.pagination,
  });
});

// ─── GET /products/featured ───

export const getFeatured = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
  const products = await productService.getFeatured(limit);

  res.status(200).json({
    success: true,
    data: products,
  });
});

// ─── GET /products/:slug ───

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getBySlug(req.params.slug as string);

  res.status(200).json({
    success: true,
    data: product,
  });
});

// ─── POST /products (Admin) ───

export const create = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product,
  });
});

// ─── PUT /products/:id (Admin) ───

export const update = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.update(req.params.id as string, req.body);

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: product,
  });
});

// ─── DELETE /products/:id (Admin) ───

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await productService.remove(req.params.id as string);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

// ─── GET /admin/products (Admin — includes inactive) ───

export const adminGetAll = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.adminGetAll(req.query as unknown as ProductQuery);

  res.status(200).json({
    success: true,
    data: result.products,
    pagination: result.pagination,
  });
});
