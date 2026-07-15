import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { myChangeRequestsApi } from '../api/myChangeRequestsApi';
import type { ChangeRequest, ChangeRequestType } from '../types/change-request.types';

const CHANGE_REQUESTS_QUERY_KEY = ['my-change-requests'] as const;

export function useMyChangeRequests() {
  return useQuery({
    queryKey: [...CHANGE_REQUESTS_QUERY_KEY],
    queryFn: () => myChangeRequestsApi.list(),
    staleTime: 60 * 1000,
  });
}

export function useChangeRequest(id: number) {
  return useQuery({
    queryKey: [...CHANGE_REQUESTS_QUERY_KEY, id],
    queryFn: () => myChangeRequestsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateChangeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { change_type: ChangeRequestType; payload: Record<string, unknown> }) =>
      myChangeRequestsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CHANGE_REQUESTS_QUERY_KEY] });
    },
  });
}
