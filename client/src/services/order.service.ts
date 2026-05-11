import { api } from '@/lib/api';
import type { ApiResponse, Order, PaginationMeta } from '@/types';
import type { CheckoutFormData } from '@/lib/validations/checkout';

export interface OrderListResponse {
  data: Order[];
  pagination: PaginationMeta;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  sort?: string;
}

interface CheckoutResponse {
  order: Order;
  payment?: {
    paymentUrl?: string;
    payload?: Record<string, string>;
    redirectUrl?: string;
    sessionId?: string;
  };
}

export const orderService = {
  async checkout(data: CheckoutFormData): Promise<CheckoutResponse> {
    const { data: res } = await api.post<ApiResponse<Order> & { payment?: CheckoutResponse['payment'] }>(
      '/orders/checkout',
      data
    );
    return { order: res.data!, payment: res.payment };
  },

  async getMyOrders(params: OrderQueryParams = {}): Promise<OrderListResponse> {
    const { data } = await api.get<ApiResponse<Order[]> & { pagination: PaginationMeta }>(
      '/orders',
      { params }
    );
    return { data: data.data!, pagination: data.pagination! };
  },

  async getOrder(id: string): Promise<Order> {
    const { data } = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return data.data!;
  },

  async cancelOrder(id: string, reason: string): Promise<Order> {
    const { data } = await api.post<ApiResponse<Order>>(
      `/orders/${id}/cancel`,
      { reason }
    );
    return data.data!;
  },

  async verifyEsewaPayment(encodedData: string): Promise<{ orderId: string; transactionCode: string }> {
    const { data } = await api.post<ApiResponse<{ orderId: string; transactionCode: string }>>(
      '/orders/esewa/verify',
      { data: encodedData }
    );
    return data.data!;
  },
};
