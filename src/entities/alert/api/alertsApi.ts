import { apiClient } from '@shared/api/client';
import type {
  AlertDto,
  AlertGenerationResultDto,
  PlanPeriodType,
} from '@shared/api/types';

export const alertsApi = {
  getMyAlerts: (params?: { unreadOnly?: boolean; take?: number }) =>
    apiClient.get<AlertDto[]>('/api/alerts/my', { params }).then((r) => r.data),

  markAsRead: (id: string) =>
    apiClient.post(`/api/alerts/${id}/read`).then((r) => r.data),

  generate: (params: { from?: string; to?: string; periodType?: PlanPeriodType }) =>
    apiClient
      .post<AlertGenerationResultDto>('/api/alerts/generate', null, { params })
      .then((r) => r.data),

  generateCeo: (params: { from?: string; to?: string; periodType?: PlanPeriodType }) =>
    apiClient
      .post<AlertGenerationResultDto>('/api/alerts/generate-ceo', null, { params })
      .then((r) => r.data),
};
