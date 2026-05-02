import { api } from '@/lib/api';
import type { ApiResponse, AuthResponse, User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface PreviewLink {
  previewUrl: string | null;
  expiresAt: string | null;
}

export interface RegisterResponse extends AuthResponse {
  emailVerification?: {
    required: boolean;
    previewUrl: string | null;
    expiresAt: string | null;
  };
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  passwordReset: PreviewLink | null;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailResponse {
  user: User;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return data.data!;
  },

  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const { name, email, password, phone } = payload;
    const { data } = await api.post<ApiResponse<RegisterResponse>>('/auth/register', {
      name,
      email,
      password,
      ...(phone?.trim() ? { phone: phone.trim() } : {}),
    });
    return data.data!;
  },

  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    const { data } = await api.post<ApiResponse<VerifyEmailResponse>>(
      '/auth/verify-email',
      { token }
    );
    return data.data!;
  },

  async forgotPassword(
    payload: ForgotPasswordPayload
  ): Promise<ForgotPasswordResponse> {
    const { data } = await api.post<ApiResponse<ForgotPasswordResponse>>(
      '/auth/forgot-password',
      payload
    );
    return data.data!;
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await api.post('/auth/reset-password', payload);
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async refreshToken(): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/refresh');
    return data.data!;
  },

  async googleLogin(idToken: string): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/google', { idToken });
    return data.data!;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data!;
  },
};
