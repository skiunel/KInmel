import { api } from '@/lib/api';
import type { ApiResponse } from '@/types';

export interface OnChainVerification {
  review: {
    _id: string;
    rating: number;
    title: string;
    content: string;
    createdAt: string;
    user: { name: string; avatar: string | null } | null;
    product: { name: string; slug: string } | null;
  };
  verificationStatus: 'pending' | 'stored' | 'verified' | 'failed';
  verificationMessage: string | null;
  buyerVerified: boolean;
  ipfsStored: boolean;
  ipfsAccessible: boolean;
  ipfsContentVerified: boolean | null;
  onChain: boolean;
  contentVerified: boolean;
  reason?: string;
  proof: {
    contentHash: string;
    ipfsCidHash: string;
    productIdHash: string;
    orderIdHash: string;
    reviewerHash: string;
    timestamp: number;
    exists: boolean;
  } | null;
  ipfsHash: string | null;
  gatewayUrl: string | null;
  blockchainTxHash: string | null;
  blockNumber: number | null;
}

export const verificationService = {
  async verifyOnChain(reviewId: string): Promise<OnChainVerification> {
    const { data } = await api.get<ApiResponse<OnChainVerification>>(
      `/reviews/${reviewId}/verify`
    );
    return data.data!;
  },
};
