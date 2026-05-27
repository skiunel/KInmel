import mongoose from 'mongoose';
import { Review, type IReview } from '../models/Review';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { ApiError } from '../utils/api-error';
import { ORDER_STATUSES, VERIFICATION_STATUSES } from '../config/constants';
import {
  buildStoredReviewDocument,
  buildGatewayUrl,
  extractPayloadFromStoredDocument,
  fetchFromIPFS,
  pinReviewToIPFS,
  readLocalMockReviewDocument,
  storeLocalMockReviewDocument,
  verifyContentIntegrity,
} from './ipfs.service';
import {
  anchorReviewOnChain,
  findAnchorTxForReview,
  isBlockchainConfigured,
  verifyReviewOnChain,
} from './blockchain.service';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import type {
  CreateReviewInput,
  ReviewQueryInput,
  FlagReviewInput,
} from '../validators/review.validators';

// ─── Eligibility Check ───
// Returns which products from a given order the user can review.
// No codes, no tokens — pure server-side validation of:
//   1. Order belongs to user
//   2. Order is delivered
//   3. User hasn't already reviewed that product for this order

export interface EligibilityItem {
  productId: string;
  name: string;
  image: string;
  eligible: boolean;
  reason: string;
  existingReview?: { _id: string; rating: number; title: string } | null;
}

export const checkEligibility = async (
  userId: string,
  orderId: string
): Promise<EligibilityItem[]> => {
  const order = await Order.findOne({ _id: orderId, user: userId });

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.status !== ORDER_STATUSES.DELIVERED) {
    // Return all items as ineligible with clear reason
    return order.items.map((item) => ({
      productId: item.product.toString(),
      name: item.name,
      image: item.image,
      eligible: false,
      reason: `Order must be delivered before reviewing. Current status: ${order.status}`,
    }));
  }

  // Fetch existing reviews for this user+order combination
  const existingReviews = await Review.find({
    user: userId,
    order: orderId,
  }).lean();

  const reviewMap = new Map(
    existingReviews.map((r) => [r.product.toString(), r])
  );

  return order.items.map((item) => {
    const productId = item.product.toString();
    const existing = reviewMap.get(productId);

    if (existing) {
      return {
        productId,
        name: item.name,
        image: item.image,
        eligible: false,
        reason: 'You have already reviewed this product for this order',
        existingReview: {
          _id: existing._id.toString(),
          rating: existing.rating,
          title: existing.title,
        },
      };
    }

    return {
      productId,
      name: item.name,
      image: item.image,
      eligible: true,
      reason: 'Eligible — order delivered, no existing review',
    };
  });
};

// ─── Create Review ───
// Full server-side validation: re-checks eligibility atomically.

export const createReview = async (
  userId: string,
  input: CreateReviewInput
): Promise<IReview> => {
  const { orderId, productId, rating, title, content } = input;

  // 1. Verify order ownership + delivery status
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.status !== ORDER_STATUSES.DELIVERED) {
    throw ApiError.forbidden(
      'Reviews can only be submitted for delivered orders'
    );
  }

  // 2. Verify the product was in this order
  const orderItem = order.items.find(
    (item) => item.product.toString() === productId
  );
  if (!orderItem) {
    throw ApiError.badRequest('This product was not part of the specified order');
  }

  // 3. Check for duplicate review (unique index will also catch this, but cleaner error)
  const existing = await Review.findOne({
    user: userId,
    order: orderId,
    product: productId,
  });
  if (existing) {
    throw ApiError.conflict(
      'You have already reviewed this product for this order'
    );
  }

  // 4. Verify product still exists
  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  // 5. Create the review
  const review = await Review.create({
    user: userId,
    product: productId,
    order: orderId,
    rating,
    title,
    content,
  });

  // 6. Pin review content to IPFS (synchronous — user waits for this)
  let ipfsHash: string | undefined;
  let contentHashHex: string | undefined;

  try {
    const ipfsResult = await pinReviewToIPFS({
      rating,
      title,
      content,
      productId,
      orderId,
      userId,
      timestamp: review.createdAt.toISOString(),
    });

    ipfsHash = ipfsResult.ipfsHash ?? undefined;
    contentHashHex = ipfsResult.contentHash;
    review.ipfsHash = ipfsHash;
    review.contentHash = contentHashHex;
    review.verificationStatus = ipfsResult.stored
      ? VERIFICATION_STATUSES.STORED
      : VERIFICATION_STATUSES.FAILED;
    review.verificationMessage = ipfsResult.reason ?? null;
    await review.save();
  } catch (err) {
    logger.error('[IPFS] Failed to pin review:', (err as Error).message);
    review.contentHash = contentHashHex ?? review.contentHash;
    review.verificationStatus = VERIFICATION_STATUSES.FAILED;
    review.verificationMessage =
      'The review was saved in Kinmel, but the IPFS storage step failed.';
    await review.save();
  }

  // 7. Anchor to blockchain (fire-and-forget — user doesn't wait)
  // Only runs if IPFS succeeded AND blockchain is configured.
  if (ipfsHash && contentHashHex && isBlockchainConfigured()) {
    anchorReviewOnChain({
      reviewId: review._id.toString(),
      contentHash: contentHashHex,
      ipfsCid: ipfsHash,
      productId,
      orderId,
      userId,
    })
      .then(async (result) => {
        review.blockchainTxHash = result.txHash;
        review.blockNumber = result.blockNumber;
        review.contractAddress = result.contractAddress;
        review.isVerified = true;
        review.verificationStatus = VERIFICATION_STATUSES.VERIFIED;
        review.verificationMessage = null;
        await review.save();
        logger.info(
          `[Blockchain] Review ${review._id} anchored — TX: ${result.txHash}`
        );
      })
      .catch(async (err) => {
        // Blockchain failure is non-fatal. Review stays as "stored" (IPFS).
        // The anchor-pending-reviews job retries these automatically.
        logger.error(
          `[Blockchain] Failed to anchor review ${review._id}:`,
          (err as Error).message
        );
        review.verificationMessage =
          'Review is stored, but blockchain anchoring is still unavailable.';
        await review.save();
      })
      .catch((saveErr: unknown) => {
        // Last-resort catch: if the .save() itself fails, log and swallow
        // so the unhandled rejection doesn't crash the process.
        logger.error(
          `[Blockchain] Failed to persist anchor result for review ${review._id}:`,
          (saveErr as Error).message
        );
      });
  }

  // 8. Update product's average rating and review count
  await recalculateProductRating(productId);

  return review;
};

export const getPublicVerification = async (reviewId: string) => {
  const review = await Review.findById(reviewId)
    .populate('user', 'name avatar')
    .populate('product', 'name slug')
    .orFail(() => ApiError.notFound('Review not found'));
  const reviewUser = review.user as unknown as {
    _id: mongoose.Types.ObjectId;
    name: string;
    avatar?: string | null;
  };
  const reviewProduct = review.product as unknown as {
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
  };

  const userId =
    typeof review.user === 'object' && reviewUser?._id
      ? reviewUser._id.toString()
      : review.user.toString();
  const productId =
    typeof review.product === 'object' && reviewProduct?._id
      ? reviewProduct._id.toString()
      : review.product.toString();

  const buyerVerified = Boolean(
    await Order.exists({
      _id: review.order,
      user: userId,
      status: ORDER_STATUSES.DELIVERED,
      'items.product': productId,
    })
  );

  const reviewPayload = {
    rating: review.rating,
    title: review.title,
    content: review.content,
    productId,
    orderId: review.order.toString(),
    userId,
    timestamp: review.createdAt.toISOString(),
  };

  if (
    review.ipfsHash &&
    review.contentHash &&
    !review.blockchainTxHash
  ) {
    if (!isBlockchainConfigured()) {
      review.verificationMessage =
        'Blockchain anchoring is not configured on the server (missing RPC URL, contract address, or signer key).';
      await review.save();
    } else {
      try {
        const result = await anchorReviewOnChain({
          reviewId: review._id.toString(),
          contentHash: review.contentHash,
          ipfsCid: review.ipfsHash,
          productId,
          orderId: review.order.toString(),
          userId,
        });
        review.blockchainTxHash = result.txHash;
        review.blockNumber = result.blockNumber;
        review.contractAddress = result.contractAddress;
        review.isVerified = true;
        review.verificationStatus = VERIFICATION_STATUSES.VERIFIED;
        review.verificationMessage = null;
        await review.save();
        logger.info(`[Blockchain] Lazy-anchored review ${review._id} (verify hit) — TX: ${result.txHash}`);
      } catch (e) {
        const msg = (e as Error).message || 'unknown error';
        // DuplicateProof: contract already has this anchor — backfill txHash
        // from the past ReviewAnchored event instead of re-throwing.
        if (msg.startsWith('DuplicateProof')) {
          const existing = await findAnchorTxForReview(review._id.toString());
          if (existing) {
            review.blockchainTxHash = existing.txHash;
            review.blockNumber = existing.blockNumber;
            review.contractAddress = env.REVIEW_CONTRACT_ADDRESS!;
            review.isVerified = true;
            review.verificationStatus = VERIFICATION_STATUSES.VERIFIED;
            review.verificationMessage = null;
            await review.save();
            logger.info(`[Blockchain] Backfilled tx for already-anchored review ${review._id}: ${existing.txHash}`);
          } else {
            review.verificationMessage = 'Review already anchored on-chain (event not found in lookback window).';
            await review.save();
          }
        } else {
          logger.warn(`[Blockchain] Lazy-anchor failed for ${review._id}: ${msg}`);
          review.verificationMessage = `Blockchain anchor attempt failed: ${msg.slice(0, 240)}`;
          await review.save();
        }
      }
    }
  }

  if (
    env.NODE_ENV === 'development' &&
    !review.ipfsHash &&
    review.contentHash &&
    review.verificationMessage?.includes(
      'Pinata credentials are not configured on the server'
    )
  ) {
    const storedDocument = buildStoredReviewDocument(reviewPayload);

    if (storedDocument.contentHash === review.contentHash) {
      review.ipfsHash = await storeLocalMockReviewDocument(storedDocument);
      review.verificationStatus = VERIFICATION_STATUSES.STORED;
      review.verificationMessage = null;

      if (!review.blockchainTxHash && isBlockchainConfigured()) {
        try {
          const result = await anchorReviewOnChain({
            reviewId: review._id.toString(),
            contentHash: review.contentHash,
            ipfsCid: review.ipfsHash,
            productId,
            orderId: review.order.toString(),
            userId,
          });

          review.blockchainTxHash = result.txHash;
          review.blockNumber = result.blockNumber;
          review.contractAddress = result.contractAddress;
          review.isVerified = true;
          review.verificationStatus = VERIFICATION_STATUSES.VERIFIED;
        } catch (error) {
          logger.error(
            `[Blockchain] Failed to backfill review ${review._id}:`,
            (error as Error).message
          );
        }
      }

      await review.save();
    }
  }

  const ipfsDocument =
    review.ipfsHash ? await fetchFromIPFS(review.ipfsHash) : null;
  const ipfsStored = Boolean(review.ipfsHash);
  const ipfsAccessible = Boolean(ipfsDocument);
  const ipfsContentVerified =
    ipfsDocument && review.contentHash
      ? verifyContentIntegrity(
          extractPayloadFromStoredDocument(ipfsDocument),
          review.contentHash
        ) &&
        ipfsDocument.contentHash === review.contentHash &&
        verifyContentIntegrity(reviewPayload, review.contentHash)
      : null;

  const blockchainResult = review.contentHash
    ? await verifyReviewOnChain(review._id.toString(), review.contentHash)
    : { exists: false, verified: false, proof: null };

  let reason: string | undefined;
  if (!buyerVerified) {
    reason = 'This review cannot be tied back to a delivered buyer order.';
  } else if (!ipfsStored) {
    reason =
      review.verificationMessage ??
      'This review is only stored in Kinmel right now. No IPFS record is attached.';
  } else if (!ipfsAccessible) {
    reason =
      'An IPFS hash exists, but the review record could not be fetched from the public gateway.';
  } else if (ipfsContentVerified === false) {
    reason =
      'The IPFS document does not match the review content currently shown in Kinmel.';
  } else if (!blockchainResult.exists) {
    reason =
      review.verificationMessage ??
      'The review is stored on IPFS, but a blockchain anchor is not available yet.';
  } else if (!blockchainResult.verified) {
    reason =
      'A blockchain proof exists, but the on-chain content hash does not match the review record.';
  }

  return {
    review: {
      _id: review._id.toString(),
      rating: review.rating,
      title: review.title,
      content: review.content,
      createdAt: review.createdAt,
      user:
        typeof review.user === 'object'
          ? {
              name: reviewUser.name,
              avatar: reviewUser.avatar ?? null,
            }
          : null,
      product:
        typeof review.product === 'object'
          ? {
              name: reviewProduct.name,
              slug: reviewProduct.slug,
            }
          : null,
    },
    verificationStatus: review.verificationStatus,
    verificationMessage: review.verificationMessage ?? null,
    buyerVerified,
    ipfsStored,
    ipfsAccessible,
    ipfsContentVerified,
    onChain: blockchainResult.exists,
    contentVerified: blockchainResult.verified,
    reason,
    proof: blockchainResult.proof,
    ipfsHash: review.ipfsHash ?? null,
    gatewayUrl: review.ipfsHash ? buildGatewayUrl(review.ipfsHash) : null,
    blockchainTxHash: review.blockchainTxHash ?? null,
    blockNumber: review.blockNumber ?? null,
  };
};

export const getStoredIpfsDocument = async (cid: string) => {
  const document = await readLocalMockReviewDocument(cid);

  if (!document) {
    throw ApiError.notFound('Stored IPFS document not found');
  }

  return document;
};

// ─── Get Product Reviews (Public) ───

export const getProductReviews = async (
  productId: string,
  query: ReviewQueryInput
) => {
  const { page, limit, sort } = query;

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    highest: { rating: -1, createdAt: -1 },
    lowest: { rating: 1, createdAt: -1 },
  };

  const filter = { product: productId, isFlagged: false };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'name avatar')
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  // Rating breakdown
  const breakdown = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), isFlagged: false } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]);

  const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const b of breakdown) {
    ratingBreakdown[b._id as number] = b.count as number;
  }

  return {
    data: reviews,
    ratingBreakdown,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

// ─── Get User's Reviews ───

export const getMyReviews = async (userId: string, query: ReviewQueryInput) => {
  const { page, limit, sort } = query;

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    highest: { rating: -1 },
    lowest: { rating: 1 },
  };

  const [reviews, total] = await Promise.all([
    Review.find({ user: userId })
      .populate('product', 'name slug images')
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments({ user: userId }),
  ]);

  return {
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

// ─── Admin: Get All Reviews ───

export const getAllReviews = async (
  query: ReviewQueryInput & { flagged?: string }
) => {
  const { page, limit, sort, flagged } = query;

  const filter: Record<string, unknown> = {};
  if (flagged === 'true') filter.isFlagged = true;
  if (flagged === 'false') filter.isFlagged = false;

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    highest: { rating: -1 },
    lowest: { rating: 1 },
  };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'name email avatar')
      .populate('product', 'name slug images')
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  return {
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

// ─── Admin: Flag / Unflag Review ───

export const flagReview = async (
  reviewId: string,
  input: FlagReviewInput
): Promise<IReview> => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  review.isFlagged = input.isFlagged;
  review.flagReason = input.flagReason || undefined;
  await review.save();

  // Recalculate product rating (flagged reviews excluded from count)
  await recalculateProductRating(review.product.toString());

  return review;
};

// ─── Admin: Delete Review ───

export const deleteReview = async (reviewId: string): Promise<void> => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  const productId = review.product.toString();
  await review.deleteOne();

  await recalculateProductRating(productId);
};

// ─── Helper: Recalculate Product Rating ───

async function recalculateProductRating(productId: string): Promise<void> {
  const result = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isFlagged: false,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const stats = result[0] || { averageRating: 0, reviewCount: 0 };

  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round((stats.averageRating as number) * 10) / 10,
    reviewCount: stats.reviewCount,
  });
}
