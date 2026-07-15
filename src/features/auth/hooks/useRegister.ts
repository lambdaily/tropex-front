import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { apiClient } from '@/shared/api/apiClient';
import { useAuthStore } from '../stores/authStore';
import type { RegisterPayload } from '../types/auth.types';

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const response = await authApi.register(payload);
      apiClient.setTokens(response.tokens);
      return response.user;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
