'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminOrderService,
  type UpdateStatusInput,
} from '@/services/admin-order.service';
import type { OrderQueryParams } from '@/services/order.service';
import { toast } from 'sonner';

export function useAdminOrders(params: OrderQueryParams = {}) {
  return useQuery({
    queryKey: ['admin-orders', params],
    queryFn: () => adminOrderService.getAll(params),
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => adminOrderService.getOrder(id),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateStatusInput & { id: string }) =>
      adminOrderService.updateStatus(id, input),
    onSuccess: (order) => {
      toast.success(`Order updated to ${order.status}`);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.setQueryData(['admin-order', order._id], order);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to update order';
      toast.error(message);
    },
  });
}
