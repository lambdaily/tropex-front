import { apiClient } from '@/shared/api/apiClient';
import type { ChangeRequest, ChangeRequestType, ChangeRequestStatus } from '../types/change-request.types';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const myChangeRequestsApi = {
  list: async (): Promise<ChangeRequest[]> => {
    const response = await apiClient.get<PaginatedResponse<ChangeRequest>>('/user-change-requests/');
    return response.results;
  },

  listAll: async (): Promise<ChangeRequest[]> => {
    const response = await apiClient.get<PaginatedResponse<ChangeRequest>>('/user-change-requests/all/');
    return response.results;
  },

  get: (id: number): Promise<ChangeRequest> =>
    apiClient.get<ChangeRequest>(`/user-change-requests/${id}/`),

  create: (data: { change_type: ChangeRequestType; payload: Record<string, unknown> }): Promise<ChangeRequest> =>
    apiClient.post<ChangeRequest>('/user-change-requests/', data),

  update: (id: number, data: { status: ChangeRequestStatus; rejection_reason?: string }): Promise<ChangeRequest> =>
    apiClient.patch<ChangeRequest>(`/user-change-requests/${id}/`, data),
};
