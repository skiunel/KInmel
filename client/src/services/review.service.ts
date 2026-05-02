import { api } from '@/lib/api';
import type {
  ApiResponse,
  Review,
  ReviewEligibility,
  PaginationMeta,
} from '@/types';

export interface CreateReviewInput {
  orderId: string;
  productId: string;
  rating: number;
  title: string;
  content: string;
}

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest';
}

export interface ProductReviewsResponse {
  data: Review[];
  ratingBreakdown: Record<number, number>;
  pagination: PaginationMeta;
}

export const reviewService = {
  async checkEligibility(orderId: string): Promise<ReviewEligibility[]> {
    const { data } = await api.get<ApiResponse<ReviewEligibility[]>>(
      `/reviews/eligibility/${orderId}`
    );
    return data.data!;
  },

  async createReview(input: CreateReviewInput): Promise<Review> {
    const { data } = await api.post<ApiResponse<Review>>('/reviews', input);
    return data.data!;
  },

  async getProductReviews(
    productId: string,
    params: ReviewQueryParams = {}
  ): Promise<ProductReviewsResponse> {
    const { data } = await api.get<
      ApiResponse<Review[]> & {
        ratingBreakdown: Record<number, number>;
        pagination: PaginationMeta;
      }
    >(`/reviews/product/${productId}`, { params });
    return {
      data: data.data!,
      ratingBreakdown: data.ratingBreakdown!,
      pagination: data.pagination!,
    };
  },

  async getMyReviews(
    params: ReviewQueryParams = {}
  ): Promise<{ data: Review[]; pagination: PaginationMeta }> {
    const { data } = await api.get<
      ApiResponse<Review[]> & { pagination: PaginationMeta }
    >('/reviews/my', { params });
    return { data: data.data!, pagination: data.pagination! };
  },
};
