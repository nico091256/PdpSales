import { apiClient } from '@shared/api/client';
import type {
  AppointmentResponse,
  CompleteAppointmentRequest,
  RejectAppointmentRequest,
  AppointmentStatus,
} from '@shared/api/types';

export const appointmentsApi = {
  getAll: (params?: { status?: AppointmentStatus }) =>
    apiClient.get<AppointmentResponse[]>('/api/appointments', { params }).then((r) => r.data),

  getMy: (params?: { from?: string; to?: string }) =>
    apiClient.get<AppointmentResponse[]>('/api/appointments/my', { params }).then((r) => r.data),

  approve: (id: string) =>
    apiClient.post<AppointmentResponse>(`/api/appointments/${id}/approve`).then((r) => r.data),

  complete: (id: string, data: CompleteAppointmentRequest) =>
    apiClient.post<AppointmentResponse>(`/api/appointments/${id}/complete`, data).then((r) => r.data),

  reject: (id: string, data: RejectAppointmentRequest) =>
    apiClient.post<AppointmentResponse>(`/api/appointments/${id}/reject`, data).then((r) => r.data),
};
