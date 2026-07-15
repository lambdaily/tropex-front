import { apiClient } from '@/shared/api/apiClient';
import type { FinancialInstitution, InstitutionType } from '../types/payment.types';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const financialInstitutionsApi = {
  list: async (type?: InstitutionType): Promise<FinancialInstitution[]> => {
    const url = `/payment/financial-institutions/${type ? `?type=${type}` : ''}`;
    console.log('[financialInstitutionsApi] GET', url);
    const response = await apiClient.get<PaginatedResponse<FinancialInstitution>>(url);
    console.log('[financialInstitutionsApi] response:', response);
    console.log('[financialInstitutionsApi] response type:', typeof response, Array.isArray(response) ? 'is array' : 'not array');
    console.log('[financialInstitutionsApi] response.results:', response?.results);
    const results = response?.results ?? [];
    console.log('[financialInstitutionsApi] returning:', results, 'length:', results.length);
    return results;
  },
};
