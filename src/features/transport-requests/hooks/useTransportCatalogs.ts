import { useQuery } from '@tanstack/react-query';
import { transportCatalogsApi } from '../api/transportCatalogsApi';

const CATALOGS_KEY = ['transport-request-catalogs'] as const;

export function useTransportCatalogs() {
  const establishmentTypes = useQuery({
    queryKey: [...CATALOGS_KEY, 'establishment-types'],
    queryFn: transportCatalogsApi.establishmentTypes,
    staleTime: 10 * 60 * 1000,
  });
  const cattleTypes = useQuery({
    queryKey: [...CATALOGS_KEY, 'cattle-types'],
    queryFn: transportCatalogsApi.cattleTypes,
    staleTime: 10 * 60 * 1000,
  });
  const truckTypes = useQuery({
    queryKey: [...CATALOGS_KEY, 'truck-types'],
    queryFn: transportCatalogsApi.truckTypes,
    staleTime: 10 * 60 * 1000,
  });
  const establishments = useQuery({
    queryKey: [...CATALOGS_KEY, 'establishments'],
    queryFn: () => transportCatalogsApi.senacsaEstablishments(),
    staleTime: 10 * 60 * 1000,
  });
  const frigorificos = useQuery({
    queryKey: [...CATALOGS_KEY, 'establishments', 'frigorifico'],
    queryFn: () => transportCatalogsApi.senacsaEstablishments({ type: 'frigorifico' }),
    staleTime: 10 * 60 * 1000,
  });

  return { establishmentTypes, cattleTypes, truckTypes, establishments, frigorificos };
}
