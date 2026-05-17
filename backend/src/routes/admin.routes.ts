import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as productController from '../controllers/product.controller';
import * as dashboardController from '../controllers/dashboard.controller';
import { asyncHandler } from '../utils/async-handler';
import {
  getBlockchainStatus,
  getRecentAnchoredEvents,
} from '../services/blockchain.service';
import { productQuerySchema } from '../validators/product.validators';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

// ─── Dashboard ───
router.get('/dashboard', dashboardController.getStats);

// ─── Users ───
router.get('/users', dashboardController.getUsers);

// ─── Admin Products (includes inactive) ───
router.get('/products', validate(productQuerySchema, 'query'), productController.adminGetAll);

// ─── Blockchain Monitor ───
router.get(
  '/blockchain/status',
  asyncHandler(async (_req, res) => {
    const status = await getBlockchainStatus();
    res.status(200).json({ success: true, data: status });
  })
);

router.get(
  '/blockchain/feed',
  asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt((req.query.limit as string) ?? '25', 10), 100);
    const events = await getRecentAnchoredEvents(limit);
    res.status(200).json({ success: true, data: events });
  })
);

export { router as adminRouter };
