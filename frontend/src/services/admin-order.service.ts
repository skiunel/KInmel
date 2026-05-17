import { api } from '@/lib/api';
import type { ApiResponse, Order, PaginationMeta } from '@/types';
import type { OrderQueryParams } from './order.service';

export interface UpdateStatusInput {
  status: string;
  message?: string;
  location?: string;
}

export const adminOrderService = {
  async getAll(params: OrderQueryParams = {}) {
    const { data } = await api.get<
      ApiResponse<Order[]> & { pagination: PaginationMeta }
    >('/orders/admin/all', { params });
    return { data: data.data!, pagination: data.pagination! };
  },

  async getOrder(id: string): Promise<Order> {
    const { data } = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return data.data!;
  },

  async updateStatus(id: string, input: UpdateStatusInput): Promise<Order> {
    const { data } = await api.put<ApiResponse<Order>>(
      `/orders/admin/${id}/status`,
      input
    );
    return data.data!;
  },
};
