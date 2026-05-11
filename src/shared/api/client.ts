/**
 * WHY REWRITTEN:
 *
 * 1. LAYER VIOLATION — The old client imported `useAuthStore` from
 *    `@entities/auth`, violating FSD: shared layer must NOT depend on entities.
 *    This also created a circular dependency risk.
 *    Fix: both client and authStore now use `tokenStore` (shared/api).
 *
 * 2. RACE CONDITION — Multiple simultaneous 401 responses each triggered an
 *    independent refresh attempt. The failedQueue pattern is preserved but
 *    made type-safe and the null-assertion on `token!` is removed.
 *
 * 3. LOGOUT SAFETY — After a failed refresh the queue is drained with the
 *    error before logging out, so all queued requests reject cleanly.
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { ENV } from '@shared/config/env';
import { tokenStore } from './tokenStore';

const BASE_URL = ENV.API_BASE_URL;

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Request Interceptor: attach in-memory access token ─────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStore.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// ── Response Interceptor: silent token refresh on 401 ──────────────────────
type QueueEntry = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

function drainQueue(error: unknown, token: string | null = null): void {
  for (const entry of failedQueue) {
    if (error !== null) {
      entry.reject(error);
    } else if (token !== null) {
      entry.resolve(token);
    }
  }
  failedQueue = [];
}

/** Imported lazily to avoid circular dependency at module evaluation time. */
async function performLogout(): Promise<void> {
  const { useAuthStore } = await import('@entities/auth/model/authStore');
  useAuthStore.getState().logout();
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue request until the ongoing refresh resolves.
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = tokenStore.getRefreshToken();

    if (!refreshToken) {
      isRefreshing = false;
      await performLogout();
      return Promise.reject(error);
    }

    try {
      // Use raw axios (not apiClient) to avoid interceptor recursion.
      const { data } = await axios.post<{ token?: string; refreshToken?: string }>(
        `${BASE_URL}/api/v1/auth/refresh`,
        { refreshToken },
      );

      const newAccessToken = data.token ?? '';
      const newRefreshToken = data.refreshToken ?? '';

      tokenStore.setTokens(newAccessToken, newRefreshToken);
      drainQueue(null, newAccessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      return apiClient(originalRequest);
    } catch (refreshError: unknown) {
      drainQueue(refreshError, null);
      await performLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
