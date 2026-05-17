import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { asyncHandler } from '../utils/async-handler';

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await dashboardService.getDashboardStats();
  res.status(200).json({ success: true, data });
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await dashboardService.getAdminUsers(req.query as never);
  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});
