'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  reviewService,
  type CreateReviewInput,
  type ReviewQueryParams,
} from '@/services/review.service';
import { toast } from 'sonner';

export function useReviewEligibility(orderId: string) {
  return useQuery({
    queryKey: ['review-eligibility', orderId],
    queryFn: () => reviewService.checkEligibility(orderId),
    enabled: !!orderId,
  });
}

export function useProductReviews(
  productId: string,
  params: ReviewQueryParams = {}
) {
  return useQuery({
    queryKey: ['product-reviews', productId, params],
    queryFn: () => reviewService.getProductReviews(productId, params),
    enabled: !!productId,
  });
}

export function useMyReviews(params: ReviewQueryParams = {}) {
  return useQuery({
    queryKey: ['my-reviews', params],
    queryFn: () => reviewService.getMyReviews(params),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) => reviewService.createReview(input),
    onSuccess: (review) => {
      toast.success('Review submitted — your feedback is now live!');
      const productId = typeof review.product === 'string' ? review.product : review.product._id;
      queryClient.invalidateQueries({
        queryKey: ['product-reviews', productId],
      });
      // Refresh product data so averageRating & reviewCount update
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['review-eligibility'] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to submit review';
      toast.error(message);
    },
  });
}
