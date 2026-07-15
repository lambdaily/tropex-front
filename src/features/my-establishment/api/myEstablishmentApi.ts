import { apiClient } from '@/shared/api/apiClient';
import type { MyEstablishment, UpdateEstablishmentPayload } from '../types/establishment.types';

const SENSITIVE_FIELDS = ['ruc', 'owner_name', 'department', 'district'] as const;

export const myEstablishmentApi = {
  list: async (): Promise<MyEstablishment[]> => {
    console.log('[myEstablishmentApi] Fetching /auth/me/...');
    const data = await apiClient.get<unknown>('/auth/me/');
    const raw = data as {
      ruc?: string;
      legal_name?: string;
      establishments?: MyEstablishment[];
    };
    const establishments = raw.establishments ?? [];
    const ruc = raw.ruc ?? '';
    const legalName = raw.legal_name ?? '';
    console.log('[myEstablishmentApi] Response establishments:', establishments, 'ruc:', ruc, 'legal_name:', legalName);
    return establishments.map((est) => ({
      ...est,
      ruc: est.ruc || ruc,
      owner_name: est.owner_name || legalName,
    }));
  },

  update: async (
    id: number,
    data: UpdateEstablishmentPayload,
    currentEstablishment: MyEstablishment
  ): Promise<{ hasChangeRequest: boolean; updated: boolean }> => {
    const sensitiveChanges: Record<string, { old: string; new: string }> = {};
    const directChanges: Record<string, string> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;

      const currentValue = (currentEstablishment as unknown as Record<string, unknown>)[key];
      const currentStr = currentValue != null ? String(currentValue) : '';
      const newStr = String(value);

      if (SENSITIVE_FIELDS.includes(key as typeof SENSITIVE_FIELDS[number])) {
        if (currentStr !== newStr) {
          sensitiveChanges[key] = { old: currentStr, new: newStr };
        }
      } else {
        if (currentStr !== newStr) {
          directChanges[key] = newStr;
        }
      }
    }

    let updated = false;
    let hasChangeRequest = false;

    if (Object.keys(directChanges).length > 0) {
      await apiClient.patch<MyEstablishment>(`/users/establishments/${id}/`, directChanges);
      updated = true;
    }

    if (Object.keys(sensitiveChanges).length > 0) {
      const payload: Record<string, unknown> = { establishment_id: id };

      for (const [field, change] of Object.entries(sensitiveChanges)) {
        payload[`${field}_old`] = change.old;
        payload[`${field}_new`] = change.new;
      }

      await apiClient.post('/user-change-requests/', {
        change_type: 'establecimiento',
        payload,
      });
      hasChangeRequest = true;
    }

    return { hasChangeRequest, updated };
  },
};
