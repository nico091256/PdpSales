import { apiClient } from '@shared/api/client';
import type {
  LogCallRequest,
  LogCallResponse,
} from '@shared/api/types';

export const callLogsApi = {
  log: (data: LogCallRequest) =>
    apiClient.post<LogCallResponse>('/api/v1/call-logs', data).then((r) => r.data),
};
