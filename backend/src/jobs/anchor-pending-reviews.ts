/**
 * Recovery job: Retries blockchain anchoring for reviews stuck at "stored"
 * (IPFS succeeded but blockchain failed or was skipped).
 *
 * Run manually:   npx ts-node -r tsconfig-paths/register src/jobs/anchor-pending-reviews.ts
 * Or on a cron:   every 5 minutes in production
 */

import mongoose from 'mongoose';
import { env } from '../config/env';
import { Review } from '../models/Review';
import { VERIFICATION_STATUSES } from '../config/constants';
import {
  anchorReviewOnChain,
  isBlockchainConfigured,
} from '../services/blockchain.service';

const BATCH_SIZE = 20;

async function run() {
  if (!isBlockchainConfigured()) {
    console.log('[AnchorJob] Blockchain not configured — skipping');
    return;
  }

  await mongoose.connect(env.MONGODB_URI);
  console.log('[AnchorJob] Connected to MongoDB');

  // Find reviews that are IPFS-stored but not yet on-chain
  const pending = await Review.find({
    verificationStatus: VERIFICATION_STATUSES.STORED,
    ipfsHash: { $ne: null },
    contentHash: { $ne: null },
    blockchainTxHash: null,
  })
    .limit(BATCH_SIZE)
    .lean();

  console.log(`[AnchorJob] Found ${pending.length} reviews to anchor`);

  let success = 0;
  let failed = 0;

  for (const review of pending) {
    try {
      const result = await anchorReviewOnChain({
        reviewId: review._id.toString(),
        contentHash: review.contentHash!,
        ipfsCid: review.ipfsHash!,
        productId: review.product.toString(),
        orderId: review.order.toString(),
        userId: review.user.toString(),
      });

      await Review.findByIdAndUpdate(review._id, {
        blockchainTxHash: result.txHash,
        blockNumber: result.blockNumber,
        contractAddress: result.contractAddress,
        isVerified: true,
        verificationStatus: VERIFICATION_STATUSES.VERIFIED,
      });

      success++;
      console.log(
        `  ✓ ${review._id} → TX: ${result.txHash.slice(0, 18)}...`
      );
    } catch (err) {
      failed++;
      console.error(
        `  ✗ ${review._id}: ${(err as Error).message}`
      );
    }
  }

  console.log(
    `[AnchorJob] Done — ${success} anchored, ${failed} failed`
  );

  await mongoose.disconnect();
}

// Allow direct execution
run().catch((err) => {
  console.error('[AnchorJob] Fatal error:', err);
  process.exit(1);
});
