import { apiClient } from '@shared/api/client';
import type { InviteListItem, SendInvitationRequest } from '@shared/api/types';

export const invitationsApi = {
  getAll: () =>
    apiClient.get<InviteListItem[]>('/api/v1/invitations').then((r) => r.data),

  send: (data: SendInvitationRequest) =>
    apiClient.post<InviteListItem>('/api/v1/invitations', data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/api/v1/invitations/${id}`).then((r) => r.data),
};
