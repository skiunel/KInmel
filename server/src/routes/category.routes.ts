import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/category.validators';

const router = Router();

// ─── Public ───

router.get('/', categoryController.getAll);
router.get('/:slug', categoryController.getBySlug);

// ─── Admin ───

router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(createCategorySchema),
  categoryController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateCategorySchema),
  categoryController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  categoryController.remove
);

export { router as categoryRouter };
