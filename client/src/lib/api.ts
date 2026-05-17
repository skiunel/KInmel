import axios from 'axios';

// Default same-origin (Vercel rewrites /api/* → Render). Refresh cookie stays first-party.
// Override with NEXT_PUBLIC_API_URL for direct backend access (dev local).
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// localStorage refresh token fallback for browsers that block third-party cookies.
const REFRESH_KEY = 'kinmel_refresh';

export function setStoredRefreshToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    try { window.localStorage.setItem(REFRESH_KEY, token); } catch { /* quota / disabled */ }
  } else {
    try { window.localStorage.removeItem(REFRESH_KEY); } catch { /* noop */ }
  }
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem(REFRESH_KEY); } catch { return null; }
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const stored = getStoredRefreshToken();
      const { data } = await api.post(
        '/auth/refresh',
        {},
        stored ? { headers: { Authorization: `Bearer ${stored}` } } : undefined,
      );
      const newAccess = data.data.accessToken;
      const newRefresh = data.data.refreshToken as string | undefined;

      if (newRefresh) setStoredRefreshToken(newRefresh);

      api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
      originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;

      processQueue(null, newAccess);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      delete api.defaults.headers.common['Authorization'];
      setStoredRefreshToken(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
