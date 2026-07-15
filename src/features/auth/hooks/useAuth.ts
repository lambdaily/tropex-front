import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { apiClient } from '@/shared/api/apiClient';
import { useAuthStore } from '../stores/authStore';
import { useLogin } from './useLogin';
import { useRegister } from './useRegister';
import { useLogout } from './useLogout';

export function useAuth() {
  const { user, isAuthenticated, isLoading, isInitialized, setUser, setInitialized, clearUser } = useAuthStore();

  const login = useLogin();
  const register = useRegister();
  const logout = useLogout();

  const hasTokens = !!apiClient.getTokens();

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: hasTokens && !isInitialized,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!isInitialized) {
      if (meQuery.isSuccess) {
        setUser(meQuery.data);
        setInitialized();
      } else if (meQuery.isError) {
        apiClient.clearTokens();
        clearUser();
        setInitialized();
      } else if (!hasTokens) {
        setInitialized();
      }
    }
  }, [meQuery.isSuccess, meQuery.isError, meQuery.data, isInitialized, hasTokens, setUser, setInitialized, clearUser]);

  const error = login.error || register.error || logout.error;

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || meQuery.isLoading,
    isInitialized,
    error: error ? extractErrorMessage(error) : null,
    login: login.mutateAsync,
    register: register.mutateAsync,
    logout: logout.mutateAsync,
    isMutating: login.isPending || register.isPending || logout.isPending,
  };
}

function extractErrorMessage(err: unknown): string | null {
  if (typeof err === 'object' && err !== null) {
    const error = err as Record<string, unknown>;
    if (typeof error.detail === 'string') return error.detail;
    if (Array.isArray(error.non_field_errors)) return error.non_field_errors.join('\n');
    if (Array.isArray(error.detail)) return error.detail.join('\n');
    const firstError = Object.values(error)[0];
    if (Array.isArray(firstError)) return firstError.join('\n');
    if (typeof firstError === 'string') return firstError;
  }
  return null;
}
