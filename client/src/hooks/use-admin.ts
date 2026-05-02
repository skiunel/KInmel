'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminService.getDashboardStats(),
    refetchInterval: 60_000,
  });
}

export function useAdminUsers(
  params: { page?: number; limit?: number; search?: string; role?: string } = {}
) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => adminService.getUsers(params),
  });
}

export function useAdminProducts(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['admin-products', params],
    queryFn: () => adminService.getProducts(params),
  });
}

export function useAdminReviews(
  params: { page?: number; limit?: number; sort?: string; flagged?: string } = {}
) {
  return useQuery({
    queryKey: ['admin-reviews', params],
    queryFn: () => adminService.getReviews(params),
  });
}

export function useFlagReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      isFlagged,
      flagReason,
    }: {
      id: string;
      isFlagged: boolean;
      flagReason?: string;
    }) => adminService.flagReview(id, isFlagged, flagReason),
    onSuccess: (_, { isFlagged }) => {
      toast.success(isFlagged ? 'Review flagged' : 'Review unflagged');
      qc.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: () => toast.error('Failed to update review'),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteReview(id),
    onSuccess: () => {
      toast.success('Review deleted');
      qc.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: () => toast.error('Failed to delete review'),
  });
}
