import { apiClient } from '@/shared/api/apiClient';

export interface Establishment {
  id: number;
  establishmentName: string;
  establishmentCode?: string;
  ownerName?: string;
  ownerSitrapCode?: string;
  department?: string;
  district?: string;
  zonalUnit?: string;
}

export interface EstablishmentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Establishment[];
}

export const establishmentApi = {
  list: (): Promise<EstablishmentListResponse> =>
    apiClient.get<EstablishmentListResponse>('/senacsa/establishments/'),
};
