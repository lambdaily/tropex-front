import { apiClient } from '@/shared/api/apiClient';
import type { MyProfile, UpdateProfilePayload } from '../types/profile.types';

export const myProfileApi = {
  get: (): Promise<MyProfile> => apiClient.get<MyProfile>('/auth/me/'),

  update: (data: UpdateProfilePayload): Promise<MyProfile> =>
    apiClient.patch<MyProfile>('/auth/me/', data),
};
