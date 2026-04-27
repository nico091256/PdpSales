import { apiClient } from '@shared/api/client';

export const adminApi = {
  getCeoDashboard: () =>
    apiClient.get('/api/admin/ceo').then((r) => r.data),

  getRopDashboard: () =>
    apiClient.get('/api/admin/rop').then((r) => r.data),

  getSalesManagerDashboard: () =>
    apiClient.get('/api/admin/sales-manager').then((r) => r.data),
};
