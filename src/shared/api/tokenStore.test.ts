/**
 * Unit tests for shared/api/tokenStore.ts
 *
 * Verifies the critical security guarantee: access tokens are never written to
 * Web Storage, and tokens are cleared correctly on logout.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { tokenStore } from '@shared/api/tokenStore';

const ACCESS = 'header.payload.sig-access';
const REFRESH = 'header.payload.sig-refresh';

beforeEach(() => {
  tokenStore.clearTokens();
  sessionStorage.clear();
});

describe('tokenStore', () => {
  it('starts with null tokens', () => {
    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
  });

  it('setTokens stores access in memory and refresh in sessionStorage', () => {
    tokenStore.setTokens(ACCESS, REFRESH);

    expect(tokenStore.getAccessToken()).toBe(ACCESS);
    expect(tokenStore.getRefreshToken()).toBe(REFRESH);
    // Verify refresh is in sessionStorage
    expect(sessionStorage.getItem('rt')).toBe(REFRESH);
  });

  it('SECURITY: access token is NEVER written to sessionStorage', () => {
    tokenStore.setTokens(ACCESS, REFRESH);

    // The access token string must not appear anywhere in sessionStorage
    const allValues = Object.values(sessionStorage);
    const found = allValues.some((v) => typeof v === 'string' && v.includes(ACCESS));
    expect(found).toBe(false);
  });

  it('setAccessToken updates only the in-memory token', () => {
    tokenStore.setTokens(ACCESS, REFRESH);
    tokenStore.setAccessToken('new-access-token');

    expect(tokenStore.getAccessToken()).toBe('new-access-token');
    // Refresh token unchanged
    expect(tokenStore.getRefreshToken()).toBe(REFRESH);
  });

  it('clearTokens wipes both tokens', () => {
    tokenStore.setTokens(ACCESS, REFRESH);
    tokenStore.clearTokens();

    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
    expect(sessionStorage.getItem('rt')).toBeNull();
  });

  it('access token is null after clearTokens (page-refresh simulation)', () => {
    // Design intent: access token lives in-memory only.
    // After clearTokens() is called (simulating logout or page refresh memory loss),
    // getAccessToken() must return null even if sessionStorage still has the refresh token.
    tokenStore.setTokens(ACCESS, REFRESH);
    tokenStore.clearTokens();
    expect(tokenStore.getAccessToken()).toBeNull();
    // Refresh token is also cleared (would need new login or AuthInitializer to restore)
    expect(tokenStore.getRefreshToken()).toBeNull();
  });
});
