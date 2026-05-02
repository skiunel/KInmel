import { Request, Response } from 'express';
import * as reviewService from '../services/review.service';
import { asyncHandler } from '../utils/async-handler';

// ─── GET /reviews/eligibility/:orderId ───
// Returns which products in this order the user can review

export const checkEligibility = asyncHandler(
  async (req: Request, res: Response) => {
    const items = await reviewService.checkEligibility(
      req.user!.id,
      req.params.orderId as string
    );

    res.status(200).json({
      success: true,
      data: items,
    });
  }
);

// ─── POST /reviews ───

export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
    const review = await reviewService.createReview(req.user!.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  }
);

// ─── GET /reviews/product/:productId ───

export const getProductReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await reviewService.getProductReviews(
      req.params.productId as string,
      req.query as never
    );

    res.status(200).json({
      success: true,
      data: result.data,
      ratingBreakdown: result.ratingBreakdown,
      pagination: result.pagination,
    });
  }
);

// ─── GET /reviews/my ───

export const getMyReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await reviewService.getMyReviews(
      req.user!.id,
      req.query as never
    );

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

// ─── GET /reviews/admin/all ───

export const getAllReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await reviewService.getAllReviews(req.query as never);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

// ─── PUT /reviews/admin/:id/flag ───

export const flagReview = asyncHandler(
  async (req: Request, res: Response) => {
    const review = await reviewService.flagReview(
      req.params.id as string,
      req.body
    );

    res.status(200).json({
      success: true,
      message: review.isFlagged ? 'Review flagged' : 'Review unflagged',
      data: review,
    });
  }
);

// ─── GET /reviews/:id/verify ───
// Public on-chain verification of a review

export const verifyOnChain = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await reviewService.getPublicVerification(req.params.id as string);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

export const getStoredIpfsDocument = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await reviewService.getStoredIpfsDocument(req.params.cid as string);

    res.status(200).json(result);
  }
);

// ─── DELETE /reviews/admin/:id ───

export const deleteReview = asyncHandler(
  async (req: Request, res: Response) => {
    await reviewService.deleteReview(req.params.id as string);

    res.status(200).json({
      success: true,
      message: 'Review deleted',
    });
  }
);
