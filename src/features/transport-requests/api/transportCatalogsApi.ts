import { apiClient } from '@/shared/api/apiClient';
import type {
  CatalogListResponse,
  CatalogOption,
  TransportEstablishment,
  TruckTypeOption,
} from '../types/catalog.types';

export interface EstablishmentQuery {
  type?: string;
  search?: string;
  department?: string;
}

interface RawTransportEstablishment extends Partial<TransportEstablishment> {
  establishmentName?: string;
  establishmentCode?: string;
  establishment_name?: string;
  establishment_code?: string;
  lat?: number | string | null;
  lng?: number | string | null;
}

function normalizeEstablishment(raw: RawTransportEstablishment): TransportEstablishment | null {
  const name = raw.name || raw.establishmentName || raw.establishment_name;
  if (!raw.id || !name) return null;

  return {
    id: raw.id,
    name,
    code: raw.code || raw.establishmentCode || raw.establishment_code,
    type: raw.type,
    department: raw.department,
    district: raw.district,
    latitude: raw.latitude ?? raw.lat,
    longitude: raw.longitude ?? raw.lng,
    verified: raw.verified,
  };
}

const queryString = (query: EstablishmentQuery = {}) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const value = params.toString();
  return value ? `?${value}` : '';
};

const listCatalog = (name: string) =>
  apiClient.get<CatalogOption[] | CatalogListResponse<CatalogOption>>(`/catalogs/${name}/`)
    .then((data) => Array.isArray(data) ? data : data.results);

export const transportCatalogsApi = {
  establishmentTypes: () => listCatalog('establishment-types'),
  cattleTypes: () => listCatalog('cattle-types'),
  truckTypes: () => apiClient
    .get<TruckTypeOption[] | CatalogListResponse<TruckTypeOption>>('/catalogs/truck-types/')
    .then((data) => Array.isArray(data) ? data : data.results),
  senacsaEstablishments: (query?: EstablishmentQuery) => apiClient
    .get<CatalogListResponse<RawTransportEstablishment> | RawTransportEstablishment[]>(`/senacsa/establishments/${queryString(query)}`)
    .then((data) => (Array.isArray(data) ? data : data.results)
      .map(normalizeEstablishment)
      .filter((establishment): establishment is TransportEstablishment => establishment !== null)),
};
