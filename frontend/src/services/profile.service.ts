import { api } from '@/lib/api';
import type { ApiResponse, User } from '@/types';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string | null;
  avatar?: string | null;
}

export const profileService = {
  async getProfile(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/users/profile');
    return data.data!;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await api.put<ApiResponse<User>>('/users/profile', payload);
    return data.data!;
  },
};
