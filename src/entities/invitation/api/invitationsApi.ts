import { apiClient } from '@shared/api/client';
import type { InviteListItem, SendInvitationRequest } from '@shared/api/types';

export const invitationsApi = {
  getAll: () =>
    apiClient.get<InviteListItem[]>('/api/v1/invites').then((r) => r.data),

  send: (data: SendInvitationRequest) =>
    apiClient.post<SendInvitationResponse>('/api/v1/invites', data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/api/v1/invites/${id}`).then((r) => r.data),

  accept: (data: { token: string; password: string; fullName: string }) =>
    apiClient.post('/api/v1/invites/accept', data).then((r) => r.data),
};
