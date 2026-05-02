import { Request, Response } from 'express';
import * as categoryService from '../services/category.service';
import { asyncHandler } from '../utils/async-handler';

// ─── GET /categories ───

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const activeOnly = req.query.active !== 'false'; // default: active only
  const categories = await categoryService.getAll({ activeOnly });

  res.status(200).json({
    success: true,
    data: categories,
  });
});

// ─── GET /categories/:slug ───

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getBySlug(req.params.slug as string);

  res.status(200).json({
    success: true,
    data: category,
  });
});

// ─── POST /categories (Admin) ───

export const create = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

// ─── PUT /categories/:id (Admin) ───

export const update = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.update(req.params.id as string, req.body);

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
});

// ─── DELETE /categories/:id (Admin) ───

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.remove(req.params.id as string);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});
