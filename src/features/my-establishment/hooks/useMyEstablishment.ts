import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { myEstablishmentApi } from '../api/myEstablishmentApi';
import type { CreateEstablishmentRequest, MyEstablishment, UpdateEstablishmentPayload } from '../types/establishment.types';

const ESTABLISHMENT_QUERY_KEY = ['my-establishment'] as const;
const PROFILE_QUERY_KEY = ['my-profile'] as const;
const CHANGE_REQUESTS_QUERY_KEY = ['user-change-requests'] as const;

export function useMyEstablishment() {
  return useQuery({
    queryKey: [...ESTABLISHMENT_QUERY_KEY],
    queryFn: () => myEstablishmentApi.list(),
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useUpdateMyEstablishment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      currentEstablishment,
    }: {
      id: number;
      data: UpdateEstablishmentPayload;
      currentEstablishment: MyEstablishment;
    }) => myEstablishmentApi.update(id, data, currentEstablishment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ESTABLISHMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...PROFILE_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_REQUESTS_QUERY_KEY] });
    },
  });
}

export function useCreateMyEstablishment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateEstablishmentRequest) => myEstablishmentApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ESTABLISHMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...PROFILE_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_REQUESTS_QUERY_KEY] });
    },
  });
}
