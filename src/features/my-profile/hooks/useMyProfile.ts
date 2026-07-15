import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { myProfileApi } from '../api/myProfileApi';
import type { MyProfile, UpdateProfilePayload } from '../types/profile.types';

const PROFILE_QUERY_KEY = ['my-profile'] as const;

export function useMyProfile() {
  return useQuery({
    queryKey: [...PROFILE_QUERY_KEY],
    queryFn: () => myProfileApi.get(),
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => myProfileApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData<MyProfile>([...PROFILE_QUERY_KEY], updated);
    },
  });
}
