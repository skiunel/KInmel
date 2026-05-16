'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService, type OrderQueryParams } from '@/services/order.service';
import { toast } from 'sonner';

export function useOrders(params: OrderQueryParams = {}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderService.getMyOrders(params),
    staleTime: 0,
    refetchInterval: 30 * 1000,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
    staleTime: 0,
    refetchInterval: 30 * 1000,
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      orderService.cancelOrder(id, reason),
    onSuccess: (order) => {
      toast.success('Order cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.setQueryData(['order', order._id], order);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to cancel order';
      toast.error(message);
    },
  });
}
