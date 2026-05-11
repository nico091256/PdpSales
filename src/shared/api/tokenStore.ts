/**
 * Module-level token store — lives in `shared/api`.
 *
 * WHY THIS EXISTS:
 * `shared/api/client.ts` must attach Authorization headers on every request.
 * It cannot import from `@entities/auth` (FSD layer violation + circular dep risk).
 * This module acts as a safe, layer-compliant bridge.
 *
 * SECURITY DESIGN:
 * - Access token: in-memory ONLY. Never written to localStorage/sessionStorage.
 *   XSS scripts can read Web Storage but cannot access the JS heap directly.
 * - Refresh token: sessionStorage. Survives page refreshes within the same tab;
 *   cleared automatically when the tab closes. Acceptable trade-off for a SPA
 *   that cannot rely on the backend to issue HttpOnly cookies.
 */

const REFRESH_KEY = 'rt'; // terse key to reduce fingerprinting surface

/** In-memory access token — reset on every page load. */
let _accessToken: string | null = null;

function readRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

function writeRefreshToken(token: string): void {
  try {
    sessionStorage.setItem(REFRESH_KEY, token);
  } catch {
    // Quota exceeded or denied (private browsing). Degrade gracefully.
  }
}

function removeRefreshToken(): void {
  try {
    sessionStorage.removeItem(REFRESH_KEY);
  } catch {
    // ignore
  }
}

export const tokenStore = {
  /** In-memory access token. Always null after a page refresh until refreshed. */
  getAccessToken: (): string | null => _accessToken,

  /** Refresh token from sessionStorage. */
  getRefreshToken: (): string | null => readRefreshToken(),

  /**
   * Persist both tokens. Call after login and after each successful refresh.
   * Access token → memory only. Refresh token → sessionStorage.
   */
  setTokens: (accessToken: string, refreshToken: string): void => {
    _accessToken = accessToken;
    writeRefreshToken(refreshToken);
  },

  /** Update access token in memory only (used after silent refresh). */
  setAccessToken: (token: string): void => {
    _accessToken = token;
  },

  /** Clear all tokens. Call on logout or when refresh fails unrecoverably. */
  clearTokens: (): void => {
    _accessToken = null;
    removeRefreshToken();
  },
} as const;
