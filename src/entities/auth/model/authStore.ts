/**
 * WHY REWRITTEN:
 *
 * 1. SECURITY — JWT tokens were stored in localStorage via Zustand persist.
 *    localStorage is accessible by ANY JavaScript on the page. A single XSS
 *    vulnerability allows an attacker to exfiltrate both tokens silently.
 *    Fix: access token → in-memory (tokenStore), refresh token → sessionStorage.
 *
 * 2. COUPLING — The old authStore stored raw token strings in Zustand state.
 *    `shared/api/client.ts` read them via `useAuthStore.getState()`, creating
 *    a shared→entities layer violation. Both layers now depend on `tokenStore`
 *    (shared/api) which is layer-compliant for both.
 *
 * 3. USER DATA — User profile (non-sensitive) is kept in sessionStorage for
 *    UX continuity (sidebar name/avatar survive page refresh). This is safe
 *    because it contains no credentials — only display info.
 *
 * MIGRATION NOTE:
 * Remove the old 'sales-auth' key from localStorage in production via a one-time
 * cleanup. A migration snippet is included in AuthInitializer.tsx.
 */

import { create } from 'zustand';
import type { UserInfo } from '@shared/api/types';
import { tokenStore } from '@shared/api/tokenStore';

const USER_SESSION_KEY = 'sales-user';

function loadUser(): UserInfo | null {
  try {
    const raw = sessionStorage.getItem(USER_SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserInfo) : null;
  } catch {
    return null;
  }
}

function persistUser(user: UserInfo): void {
  try {
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  } catch {
    // Storage unavailable — data will not survive page refresh.
  }
}

function clearUser(): void {
  try {
    sessionStorage.removeItem(USER_SESSION_KEY);
  } catch {
    // ignore
  }
}

interface AuthState {
  user: UserInfo | null;
  /**
   * True when we have confirmed a valid session (access token in memory).
   * Starts as false; becomes true after login OR after a successful silent
   * refresh in AuthInitializer. Components should await `isReady` first.
   */
  isAuthenticated: boolean;

  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: UserInfo) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: loadUser(),
  // False on init — AuthInitializer will promote to true after silent refresh.
  isAuthenticated: false,

  setTokens: (accessToken, refreshToken) => {
    tokenStore.setTokens(accessToken, refreshToken);
    set({ isAuthenticated: true });
  },

  setUser: (user) => {
    persistUser(user);
    set({ user });
  },

  logout: () => {
    tokenStore.clearTokens();
    clearUser();
    set({ user: null, isAuthenticated: false });
  },
}));
