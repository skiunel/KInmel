'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { authService, type LoginPayload, type RegisterPayload } from '@/services/auth.service';
import { setStoredRefreshToken } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { ROUTES } from '@/lib/constants';

export function useLogin() {
  const { setUser, setAccessToken } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      if (data.refreshToken) setStoredRefreshToken(data.refreshToken);
      setUser(data.user);
      showToast.success(`Welcome back, ${data.user.name}!`);

      if (data.user.role === 'admin') {
        router.push(ROUTES.admin);
      } else {
        router.push(ROUTES.home);
      }
    },
    onError: (error) => {
      showToast.error(error);
    },
  });
}

export function useGoogleLogin() {
  const { setUser, setAccessToken } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (idToken: string) => authService.googleLogin(idToken),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      if (data.refreshToken) setStoredRefreshToken(data.refreshToken);
      setUser(data.user);
      showToast.success(`Welcome, ${data.user.name}!`);

      if (data.user.role === 'admin') {
        router.push(ROUTES.admin);
      } else {
        router.push(ROUTES.home);
      }
    },
    onError: (error) => {
      showToast.error(error);
    },
  });
}

export function useRegister() {
  const { setUser, setAccessToken } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      if (data.refreshToken) setStoredRefreshToken(data.refreshToken);
      setUser(data.user);
      if (data.emailVerification?.previewUrl) {
        showToast.success('Account created. Opening verification preview.');
        window.location.assign(data.emailVerification.previewUrl);
        return;
      }

      showToast.success('Account created successfully!');
      router.push(ROUTES.home);
    },
    onError: (error) => {
      showToast.error(error);
    },
  });
}

export function useLogout() {
  const { logout } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      setStoredRefreshToken(null);
      logout();
      showToast.success('Logged out successfully');
      router.push(ROUTES.login);
    },
    onError: () => {
      setStoredRefreshToken(null);
      logout();
      router.push(ROUTES.login);
    },
  });
}
