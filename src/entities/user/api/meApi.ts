/**
 * WHY REWRITTEN:
 *
 * The original implementation had a dangerous fallback pattern:
 *
 *   try { GET /api/v1/me } catch { GET /api/me }
 *
 * This silently swallowed ALL errors — including 401 Unauthorized.
 * A 401 should trigger the axios interceptor's refresh logic. Catching it here
 * prevented the interceptor from ever seeing it, meaning expired sessions
 * would silently fail to refresh and the user would see wrong/stale data.
 *
 * Fix: remove the fallback entirely. The interceptor handles 401 correctly.
 * If the /api/v1/me endpoint does not exist in some environments, that is a
 * backend routing issue — it must not be masked in the frontend.
 */

import { apiClient } from '@shared/api/client';
import type { MeResponse } from '@shared/api/types';

export const meApi = {
  getMe: () =>
    apiClient.get<MeResponse>('/api/v1/me').then((r) => r.data),
};
