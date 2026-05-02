import { Router } from 'express';
import { healthRouter } from './health.routes';
import { authRouter } from './auth.routes';
import { categoryRouter } from './category.routes';
import { productRouter } from './product.routes';
import { adminRouter } from './admin.routes';
import { cartRouter } from './cart.routes';
import { orderRouter } from './order.routes';
import { reviewRouter } from './review.routes';
import { userRouter } from './user.routes';

const router = Router();

// Health check
router.use(healthRouter);

// Auth
router.use('/auth', authRouter);

// Categories
router.use('/categories', categoryRouter);

// Products
router.use('/products', productRouter);

// Admin
router.use('/admin', adminRouter);

// Cart
router.use('/cart', cartRouter);

// Orders
router.use('/orders', orderRouter);

// Reviews
router.use('/reviews', reviewRouter);

// Users
router.use('/users', userRouter);

export { router };
