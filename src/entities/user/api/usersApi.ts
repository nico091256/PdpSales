import { apiClient } from '@shared/api/client';
import type { UserListItem, UpdateUserRequest } from '@shared/api/types';

export const usersApi = {
  getAll: (params?: { includeDeleted?: boolean }) =>
    apiClient.get<UserListItem[]>('/api/v1/users', { params }).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/api/v1/users/${id}`).then((r) => r.data),

  restore: (id: string) =>
    apiClient.post(`/api/v1/users/${id}/restore`).then((r) => r.data),

  update: (id: string, data: UpdateUserRequest) =>
    apiClient.put<UserListItem>(`/api/v1/users/${id}`, data).then((r) => r.data),
};
