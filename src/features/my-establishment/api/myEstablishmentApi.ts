import { apiClient } from '@/shared/api/apiClient';
import type { CreateEstablishmentRequest, MyEstablishment, UpdateEstablishmentPayload } from '../types/establishment.types';

const SENSITIVE_FIELDS = ['ruc', 'owner_name', 'department', 'district'] as const;
type SensitiveField = typeof SENSITIVE_FIELDS[number];

interface SensitiveChange {
  field: SensitiveField;
  old: string;
  new: string;
}

function normalizeValue(value: unknown): string {
  return value == null ? '' : String(value).trim();
}

function buildChangeRequestPayload(establishmentId: number, change: SensitiveChange): Record<string, unknown> {
  // `field/old/new` is the canonical API shape. The *_old/*_new aliases keep
  // compatibility with the admin UI and older approval handlers.
  return {
    establishment_id: establishmentId,
    field: change.field,
    old: change.old,
    new: change.new,
    [`${change.field}_old`]: change.old,
    [`${change.field}_new`]: change.new,
  };
}

async function submitSensitiveChangeRequests(
  establishmentId: number,
  changes: SensitiveChange[],
): Promise<void> {
  for (const change of changes) {
    await apiClient.post('/user-change-requests/', {
      change_type: 'establecimiento',
      payload: buildChangeRequestPayload(establishmentId, change),
    });
  }
}

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

  create: async ({ data, sensitiveData }: CreateEstablishmentRequest): Promise<MyEstablishment> => {
    const establishment = await apiClient.post<MyEstablishment>('/users/establishments/', data);
    const changes = SENSITIVE_FIELDS
      .map((field) => ({
        field,
        old: '',
        new: normalizeValue(sensitiveData[field]),
      }))
      .filter((change) => Boolean(change.new));

    await submitSensitiveChangeRequests(establishment.id, changes);

    return establishment;
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
      const currentStr = normalizeValue(currentValue);
      const newStr = normalizeValue(value);

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

    if (Object.keys(directChanges).length > 0) {
      await apiClient.patch<MyEstablishment>(`/users/establishments/${id}/`, directChanges);
      updated = true;
    }

    const changes = Object.entries(sensitiveChanges).map(([field, change]) => ({
      field: field as SensitiveField,
      old: change.old,
      new: change.new,
    }));
    await submitSensitiveChangeRequests(id, changes);

    return { hasChangeRequest: changes.length > 0, updated };
  },
};
