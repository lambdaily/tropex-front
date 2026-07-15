import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';
import type { User } from '../types/user.types';

const USERS_QUERY_KEY = ['users'] as const;

export function useUsers() {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY],
    queryFn: async () => {
      console.log('[useUsers] Fetching users...');
      try {
        const data = await usersApi.list();
        console.log('[useUsers] Users fetched:', data);
        return data;
      } catch (error) {
        console.error('[useUsers] Error fetching users:', error);
        throw error;
      }
    },
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, id],
    queryFn: () => usersApi.get(id),
    enabled: !!id,
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.suspend(id),
    onSuccess: (updated) => {
      queryClient.setQueryData<User[]>([...USERS_QUERY_KEY], (old) =>
        old?.map((u) => (u.id === updated.id ? updated : u))
      );
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.reactivate(id),
    onSuccess: (updated) => {
      queryClient.setQueryData<User[]>([...USERS_QUERY_KEY], (old) =>
        old?.map((u) => (u.id === updated.id ? updated : u))
      );
    },
  });
}
