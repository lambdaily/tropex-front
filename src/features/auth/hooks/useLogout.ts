import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { apiClient } from '@/shared/api/apiClient';
import { useAuthStore } from '../stores/authStore';

export function useLogout() {
  const clearUser = useAuthStore((s) => s.clearUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const tokens = apiClient.getTokens();
      if (tokens?.refresh) {
        try {
          await authApi.logout(tokens.refresh);
        } catch {
          // ignore logout errors
        }
      }
      apiClient.clearTokens();
    },
    onSuccess: () => {
      clearUser();
      queryClient.clear();
    },
  });
}
