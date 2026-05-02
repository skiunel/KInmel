import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { addToCartSchema, updateCartItemSchema } from '../validators/cart.validators';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', validate(addToCartSchema), cartController.addToCart);
router.put('/items/:productId', validate(updateCartItemSchema), cartController.updateItem);
router.delete('/items/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);

export { router as cartRouter };
