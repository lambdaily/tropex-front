import { apiClient } from '@/shared/api/apiClient';
import type { ChangeRequest, ChangeRequestType, ChangeRequestStatus } from '../types/change-request.types';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

type RawChangeRequest = ChangeRequest & {
  reason?: string | null;
  rejectionReason?: string | null;
};

function normalizeChangeRequest(request: RawChangeRequest): ChangeRequest {
  const payloadReason = request.payload?.rejection_reason ?? request.payload?.reason;
  const rejectionReason = request.status === 'rejected'
    ? request.rejection_reason || request.reason || request.rejectionReason || (typeof payloadReason === 'string' ? payloadReason : '')
    : '';

  return {
    ...request,
    rejection_reason: rejectionReason,
  };
}

export const myChangeRequestsApi = {
  list: async (): Promise<ChangeRequest[]> => {
    const response = await apiClient.get<PaginatedResponse<ChangeRequest>>('/user-change-requests/');
    return response.results.map((request) => normalizeChangeRequest(request as RawChangeRequest));
  },

  listAll: async (): Promise<ChangeRequest[]> => {
    const response = await apiClient.get<PaginatedResponse<ChangeRequest>>('/user-change-requests/all/');
    return response.results.map((request) => normalizeChangeRequest(request as RawChangeRequest));
  },

  get: async (id: number): Promise<ChangeRequest> => {
    const request = await apiClient.get<RawChangeRequest>(`/user-change-requests/${id}/`);
    return normalizeChangeRequest(request);
  },

  create: (data: { change_type: ChangeRequestType; payload: Record<string, unknown> }): Promise<ChangeRequest> =>
    apiClient.post<ChangeRequest>('/user-change-requests/', data),

  update: (id: number, data: { status: ChangeRequestStatus; rejection_reason?: string }): Promise<ChangeRequest> =>
    apiClient.patch<ChangeRequest>(`/user-change-requests/${id}/`, data),
};
