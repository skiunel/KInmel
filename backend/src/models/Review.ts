import mongoose, { Schema, Document } from 'mongoose';
import {
  VERIFICATION_STATUSES,
  type VerificationStatus,
} from '../config/constants';

// ─── Interface ───

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  content: string;

  // Blockchain verification fields
  ipfsHash?: string;
  blockchainTxHash?: string;
  blockNumber?: number;
  contractAddress?: string;
  contentHash?: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationMessage?: string | null;

  // Moderation
  isFlagged: boolean;
  flagReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
      index: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title must be at most 120 characters'],
    },
    content: {
      type: String,
      required: [true, 'Review content is required'],
      trim: true,
      minlength: [10, 'Content must be at least 10 characters'],
      maxlength: [2000, 'Content must be at most 2000 characters'],
    },

    // Blockchain
    ipfsHash: { type: String, default: null },
    blockchainTxHash: { type: String, default: null },
    blockNumber: { type: Number, default: null },
    contractAddress: { type: String, default: null },
    contentHash: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUSES),
      default: VERIFICATION_STATUSES.PENDING,
    },
    verificationMessage: { type: String, default: null },

    // Moderation
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Indexes ───

// One review per user per order per product (prevents duplicates)
reviewSchema.index({ user: 1, order: 1, product: 1 }, { unique: true });

// Product reviews listing (sorted by newest)
reviewSchema.index({ product: 1, createdAt: -1 });

// Admin: flagged reviews
reviewSchema.index({ isFlagged: 1 });

// ─── Model ───

export const Review = mongoose.model<IReview>('Review', reviewSchema);
