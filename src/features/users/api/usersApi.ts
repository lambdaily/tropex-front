import { apiClient } from '@/shared/api/apiClient';
import type { PaginatedUsers, User, UserStatus } from '../types/user.types';

export const usersApi = {
  list: async (): Promise<User[]> => {
    const response = await apiClient.get<PaginatedUsers>('/users/');
    return response.results;
  },

  get: (id: number): Promise<User> =>
    apiClient.get<User>(`/users/${id}/`),

  update: (id: number, data: Partial<User>): Promise<User> =>
    apiClient.patch<User>(`/users/${id}/`, data),

  suspend: (id: number): Promise<User> =>
    apiClient.patch<User>(`/users/${id}/`, { status: 'suspended' as UserStatus }),

  reactivate: (id: number): Promise<User> =>
    apiClient.patch<User>(`/users/${id}/`, { status: 'active' as UserStatus }),
};
