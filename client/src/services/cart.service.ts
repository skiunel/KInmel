import { api } from '@/lib/api';
import type { ApiResponse, Cart } from '@/types';

export interface CartSummary extends Cart {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
}

export const cartService = {
  async getCart(): Promise<CartSummary> {
    const { data } = await api.get<ApiResponse<CartSummary>>('/cart');
    return data.data!;
  },

  async addToCart(productId: string, quantity: number): Promise<CartSummary> {
    const { data } = await api.post<ApiResponse<CartSummary>>('/cart/items', {
      productId,
      quantity,
    });
    return data.data!;
  },

  async updateItem(productId: string, quantity: number): Promise<CartSummary> {
    const { data } = await api.put<ApiResponse<CartSummary>>(
      `/cart/items/${productId}`,
      { quantity }
    );
    return data.data!;
  },

  async removeItem(productId: string): Promise<CartSummary> {
    const { data } = await api.delete<ApiResponse<CartSummary>>(
      `/cart/items/${productId}`
    );
    return data.data!;
  },

  async clearCart(): Promise<void> {
    await api.delete('/cart');
  },
};
