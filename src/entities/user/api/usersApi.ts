import { apiClient } from '@shared/api/client';
import type { UserListItem } from '@shared/api/types';

export const usersApi = {
  getAll: (params?: { includeDeleted?: boolean }) =>
    apiClient.get<UserListItem[]>('/api/v1/users', { params }).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/api/v1/users/${id}`).then((r) => r.data),

  restore: (id: string) =>
    apiClient.post(`/api/v1/users/${id}/restore`).then((r) => r.data),
};
