import { useQuery } from '@tanstack/react-query';
import { financialInstitutionsApi } from '../api/financialInstitutionsApi';
import type { FinancialInstitution, InstitutionType } from '../types/payment.types';

const INSTITUTIONS_QUERY_KEY = ['payment', 'financial-institutions'] as const;

const EMPTY_INSTITUTIONS: FinancialInstitution[] = [];

export function usePaymentInstitutions(type?: InstitutionType) {
  return useQuery({
    queryKey: [...INSTITUTIONS_QUERY_KEY, type],
    queryFn: async () => {
      const result = await financialInstitutionsApi.list(type);
      console.log('[usePaymentInstitutions] queryFn result:', result, 'isArray:', Array.isArray(result), 'length:', result?.length);
      return result;
    },
    enabled: type !== undefined,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}

export { EMPTY_INSTITUTIONS };