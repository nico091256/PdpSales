import { apiClient } from '@shared/api/client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  LogoutRequest,
  GoogleLinkResponse,
  GoogleStatusResponse,
} from '@shared/api/types';

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/api/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post<LoginResponse>('/api/auth/register', data).then((r) => r.data),

  logout: (data: LogoutRequest) =>
    apiClient.post('/api/auth/logout', data).then((r) => r.data),

  refresh: (data: RefreshTokenRequest) =>
    apiClient.post<LoginResponse>('/api/auth/refresh', data).then((r) => r.data),

  getGoogleLink: () =>
    apiClient.get<GoogleLinkResponse>('/api/auth/google/link').then((r) => r.data),

  getGoogleStatus: () =>
    apiClient.get<GoogleStatusResponse>('/api/auth/google/status').then((r) => r.data),

  googleStart: (params: {
    companySlug?: string;
    companyId?: string;
    inviteToken?: string;
    redirectUrl?: string;
  }) => apiClient.get('/api/auth/google/start', { params }).then((r) => r.data),
};
