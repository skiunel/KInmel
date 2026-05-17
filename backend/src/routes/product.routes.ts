import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../validators/product.validators';

const router = Router();

// ─── Public ───

router.get('/', validate(productQuerySchema, 'query'), productController.getAll);
router.get('/featured', productController.getFeatured);
router.get('/:slug', productController.getBySlug);

// ─── Admin ───

router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(createProductSchema),
  productController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateProductSchema),
  productController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  productController.remove
);

export { router as productRouter };
