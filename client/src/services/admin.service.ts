import { api } from '@/lib/api';
import type {
  ApiResponse,
  DashboardStats,
  User,
  Product,
  Review,
  PaginationMeta,
} from '@/types';

// ─── Dashboard ───

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await api.get<ApiResponse<DashboardStats>>(
      '/admin/dashboard'
    );
    return data.data!;
  },

  // ─── Users ───

  async getUsers(
    params: { page?: number; limit?: number; search?: string; role?: string } = {}
  ) {
    const { data } = await api.get<
      ApiResponse<User[]> & { pagination: PaginationMeta }
    >('/admin/users', { params });
    return { data: data.data!, pagination: data.pagination! };
  },

  // ─── Products (admin — includes inactive) ───

  async getProducts(params: Record<string, unknown> = {}) {
    const { data } = await api.get<
      ApiResponse<Product[]> & { pagination: PaginationMeta }
    >('/admin/products', { params });
    return { data: data.data!, pagination: data.pagination! };
  },

  // ─── Reviews (admin) ───

  async getReviews(
    params: { page?: number; limit?: number; sort?: string; flagged?: string } = {}
  ) {
    const { data } = await api.get<
      ApiResponse<Review[]> & { pagination: PaginationMeta }
    >('/reviews/admin/all', { params });
    return { data: data.data!, pagination: data.pagination! };
  },

  async flagReview(id: string, isFlagged: boolean, flagReason?: string) {
    const { data } = await api.put<ApiResponse<Review>>(
      `/reviews/admin/${id}/flag`,
      { isFlagged, flagReason }
    );
    return data.data!;
  },

  async deleteReview(id: string) {
    await api.delete(`/reviews/admin/${id}`);
  },

  // ─── Blockchain Monitor ───

  async getBlockchainStatus(): Promise<BlockchainStatus> {
    const { data } = await api.get<ApiResponse<BlockchainStatus>>(
      '/admin/blockchain/status'
    );
    return data.data!;
  },

  async getBlockchainFeed(limit = 25): Promise<OnChainEvent[]> {
    const { data } = await api.get<ApiResponse<OnChainEvent[]>>(
      '/admin/blockchain/feed',
      { params: { limit } }
    );
    return data.data!;
  },
};

export interface BlockchainStatus {
  configured: boolean;
  connected: boolean;
  network: {
    chainId: number;
    name: string;
    explorerUrl: string;
    rpcUrl: string;
  } | null;
  contractAddress: string | null;
  proofCount: number;
  paused: boolean;
  signerAddress: string | null;
  signerBalance: string | null;
}

export interface OnChainEvent {
  txHash: string;
  blockNumber: number;
  reviewIdHash: string;
  productIdHash: string;
  reviewerHash: string;
  contentHash: string;
  ipfsCidHash: string;
  orderIdHash: string;
  timestamp: number;
  explorerUrl: string;
}
