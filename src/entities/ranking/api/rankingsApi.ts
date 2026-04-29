import { apiClient } from '@shared/api/client';
import type { RankingItem } from '@shared/api/types';

export const rankingsApi = {
  getAll: (params?: { period?: 'month' | 'quarter' | 'year' }) =>
    apiClient.get<RankingItem[]>('/api/v1/rankings', { params }).then((r) => r.data),
};
