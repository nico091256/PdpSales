import { apiClient } from '@shared/api/client';
import type { ProfileDto, UpdateProfileRequest, MeResponse } from '@shared/api/types';

export const profileApi = {
  getMe: () =>
    apiClient.get<MeResponse>('/api/v1/auth/me').then((r) => r.data),

  getProfile: () =>
    apiClient.get<ProfileDto>('/api/v1/profile').then((r) => r.data),

  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.put<ProfileDto>('/api/v1/profile', data).then((r) => r.data),

  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ photoUrl: string }>('/api/v1/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};
