/**
 * AuthInitializer — silent token refresh on app boot.
 *
 * WHY THIS EXISTS:
 * The access token lives in-memory only (security requirement). After any page
 * refresh the in-memory token is lost. If a valid refresh token exists in
 * sessionStorage, we silently obtain a new access token before rendering the
 * route tree, preventing a false-positive logout on every F5.
 *
 * MIGRATION:
 * On first render this component also removes the old 'sales-auth' key that
 * the previous Zustand persist middleware wrote to localStorage.
 *
 * FLOW:
 *   1. Check sessionStorage for refresh token.
 *   2a. No token → stay unauthenticated → PrivateRoute redirects to /login.
 *   2b. Token found → call POST /api/v1/auth/refresh.
 *   3a. Success → store new access token in memory, mark isAuthenticated.
 *   3b. Failure (expired/revoked) → clear storage, stay unauthenticated.
 *   4. In all cases set `ready = true` to un-block the UI.
 */

import { useEffect, useRef, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import { useAuthStore } from '@entities/auth/model/authStore';
import { tokenStore } from '@shared/api/tokenStore';
import type { LoginResponse } from '@shared/api/types';

import { ENV } from '@shared/config/env';

const BASE_URL = ENV.API_BASE_URL;

interface Props {
  children: React.ReactNode;
}

export function AuthInitializer({ children }: Props) {
  const [ready, setReady] = useState(false);
  const { setTokens, setUser, logout } = useAuthStore();
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    /**
     * One-time migration: remove legacy localStorage entry.
     * Prevents old auth state from interfering with the new tokenStore system.
     */
    try {
      localStorage.removeItem('sales-auth');
    } catch {
      // ignore storage errors
    }

    const refreshToken = tokenStore.getRefreshToken();

    if (!refreshToken) {
      setReady(true);
      return;
    }

    // Attempt silent refresh using raw axios to avoid interceptor side-effects.
    axios
      .post<LoginResponse>(`${BASE_URL}/api/v1/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        const accessToken = data.token ?? '';
        const newRefresh = data.refreshToken ?? '';

        if (!accessToken) {
          throw new Error('Refresh response missing access token');
        }

        setTokens(accessToken, newRefresh);
        if (data.user) setUser(data.user);
      })
      .catch((err: unknown) => {
        // Refresh failed (expired or revoked) — clear storage and force re-login.
        logout();
        
        if (isAxiosError(err) && err.response?.status !== 401) {
          // If it's a real server error (not just 401), log it for debugging.
          console.error('[AuthInitializer] Silent refresh failed:', err.message);
        }
      })
      .finally(() => {
        setReady(true);
      });
  }, [logout, setTokens, setUser]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F1117]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
