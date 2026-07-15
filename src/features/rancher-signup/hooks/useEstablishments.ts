import { useQuery } from '@tanstack/react-query';
import { establishmentApi } from '../api/establishmentApi';
import type { AutocompleteOption } from '@/app/components/ui/autocomplete-input';

const ESTABLISHMENTS_QUERY_KEY = ['senacsa', 'establishments'] as const;

export function useEstablishments() {
  return useQuery({
    queryKey: ESTABLISHMENTS_QUERY_KEY,
    queryFn: establishmentApi.list,
    select: (data) => ({
      options: data.results.map((est) => ({
        code: est.establishmentCode || est.establishmentName,
        name: est.establishmentName,
        display: est.establishmentName,
      })) as AutocompleteOption[],
      establishments: data.results,
    }),
    staleTime: 10 * 60 * 1000,
  });
}
