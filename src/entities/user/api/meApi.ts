import { apiClient } from '@shared/api/client';
import type { MeResponse } from '@shared/api/types';

export const meApi = {
  getMe: async () => {
    try {
      const response = await apiClient.get<MeResponse>('/api/v1/me');
      return response.data;
    } catch {
      const fallbackResponse = await apiClient.get<MeResponse>('/api/me');
      return fallbackResponse.data;
    }
  },
};
