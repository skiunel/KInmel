import axios from 'axios';

// Default same-origin (Vercel rewrites /api/* → Render). Refresh cookie stays first-party.
// Override with NEXT_PUBLIC_API_URL for direct backend access (dev local).
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Token Refresh Interceptor ───
// Handles 401 responses by attempting to refresh the access token
// and retrying the original request. Queues concurrent requests
// to prevent multiple refresh calls.

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

    // Only intercept 401s, and don't intercept refresh/login/register requests
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
      // Queue this request until refresh completes
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
      const { data } = await api.post('/auth/refresh');
      const newToken = data.data.accessToken;

      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

      processQueue(null, newToken);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Clear auth state — redirect to login happens in auth provider
      delete api.defaults.headers.common['Authorization'];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
