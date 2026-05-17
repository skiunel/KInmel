import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import {
  createReviewSchema,
  reviewQuerySchema,
  flagReviewSchema,
} from '../validators/review.validators';

const router = Router();

// ─── Public ───

// Get reviews for a product (no auth required)
router.get(
  '/product/:productId',
  validate(reviewQuerySchema, 'query'),
  reviewController.getProductReviews
);

// Read locally stored development IPFS records
router.get('/ipfs/:cid', reviewController.getStoredIpfsDocument);

// Verify a review on-chain (no auth required)
router.get('/:id/verify', reviewController.verifyOnChain);

// Public blockchain config diagnostic
router.get('/blockchain/status', reviewController.getChainStatus);

// ─── Authenticated Customer ───

router.use(authenticate);

// Check review eligibility for an order
router.get('/eligibility/:orderId', reviewController.checkEligibility);

// Submit a review
router.post('/', validate(createReviewSchema), reviewController.createReview);

// Get my reviews
router.get(
  '/my',
  validate(reviewQuerySchema, 'query'),
  reviewController.getMyReviews
);

// ─── Admin ───

router.get(
  '/admin/all',
  authorize('admin'),
  validate(reviewQuerySchema, 'query'),
  reviewController.getAllReviews
);

router.put(
  '/admin/:id/flag',
  authorize('admin'),
  validate(flagReviewSchema),
  reviewController.flagReview
);

router.delete(
  '/admin/:id',
  authorize('admin'),
  reviewController.deleteReview
);

export { router as reviewRouter };
