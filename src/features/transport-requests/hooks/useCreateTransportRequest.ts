import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transportRequestsApi } from '../api/transportRequestsApi';
import type { CreateTransportRequestPayload } from '../types/transport-request.types';

export function useCreateTransportRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransportRequestPayload) => transportRequestsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['transport-requests'] });
    },
  });
}
