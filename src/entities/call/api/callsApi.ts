import { apiClient } from '@shared/api/client';
import type {
  CallsSummaryDto,
  CallStatDto,
  CreateCallStatRequest,
} from '@shared/api/types';

export const callsApi = {
  getSummary: (params?: { from?: string; to?: string; userId?: string }) =>
    apiClient.get<CallsSummaryDto>('/api/v1/calls', { params }).then((r) => r.data),

  getMySummary: (params?: { from?: string; to?: string }) =>
    apiClient.get<CallsSummaryDto>('/api/v1/calls/me', { params }).then((r) => r.data),

  create: (data: CreateCallStatRequest) =>
    apiClient.post<CallStatDto>('/api/v1/calls', data).then((r) => r.data),
};
