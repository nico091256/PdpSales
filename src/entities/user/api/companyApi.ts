import { apiClient } from '@shared/api/client';
import type { CompanySettingsDto, UpdateCompanySettingsRequest } from '@shared/api/types';

export const companyApi = {
  getSettings: () =>
    apiClient.get<CompanySettingsDto>('/api/v1/company/settings').then((r) => r.data),

  updateSettings: (data: UpdateCompanySettingsRequest) =>
    apiClient.put<CompanySettingsDto>('/api/v1/company/settings', data).then((r) => r.data),
};
