import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as productController from '../controllers/product.controller';
import * as dashboardController from '../controllers/dashboard.controller';
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

export { router as adminRouter };
