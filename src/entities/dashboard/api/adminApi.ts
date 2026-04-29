import { apiClient } from '@shared/api/client';
import type { CeoDashboardDto, RopDashboardDto, SalesManagerDashboardDto } from '@shared/api/types';

export const adminApi = {
  getCeoDashboard: () =>
    apiClient.get<CeoDashboardDto>('/api/v1/dashboard/ceo').then((r) => r.data),

  getRopDashboard: () =>
    apiClient.get<RopDashboardDto>('/api/v1/dashboard/rop').then((r) => r.data),

  getSalesManagerDashboard: () =>
    apiClient.get<SalesManagerDashboardDto>('/api/v1/dashboard/manager').then((r) => r.data),
};
