import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import {
  checkoutSchema,
  cancelOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
} from '../validators/order.validators';

const router = Router();

// ─── Payment Verification (no auth — eSewa callback) ───
router.post('/esewa/verify', orderController.verifyEsewa);

// All other order routes require authentication
router.use(authenticate);

// ─── Customer Routes ───

router.post('/checkout', validate(checkoutSchema), orderController.checkout);
router.get('/', validate(orderQuerySchema, 'query'), orderController.getMyOrders);
router.get('/:id', orderController.getOrder);
router.post('/:id/cancel', validate(cancelOrderSchema), orderController.cancelOrder);

// ─── Admin Routes ───

router.get(
  '/admin/all',
  authorize('admin'),
  validate(orderQuerySchema, 'query'),
  orderController.getAllOrders
);

router.put(
  '/admin/:id/status',
  authorize('admin'),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

export { router as orderRouter };
