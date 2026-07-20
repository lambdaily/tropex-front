import { apiClient } from '@/shared/api/apiClient';
import type {
  CreateOfferPayload,
  MarketplaceOffer,
  MarketplaceOfferWithRequest,
  MarketplaceShipmentRequest,
} from '../types/marketplace.types';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const getResults = <T>(response: PaginatedResponse<T> | T[]): T[] => (
  Array.isArray(response) ? response : response.results
);

export const marketplaceApi = {
  listAvailableRequests: async (): Promise<MarketplaceShipmentRequest[]> => {
    const response = await apiClient.get<PaginatedResponse<MarketplaceShipmentRequest> | MarketplaceShipmentRequest[]>(
      '/shipment-requests/available/'
    );
    return getResults(response);
  },

  listMyRequests: async (): Promise<MarketplaceShipmentRequest[]> => {
    const response = await apiClient.get<PaginatedResponse<MarketplaceShipmentRequest> | MarketplaceShipmentRequest[]>(
      '/shipment-requests/'
    );
    return getResults(response);
  },

  listOffers: async (requestId: number): Promise<MarketplaceOffer[]> => {
    const response = await apiClient.get<PaginatedResponse<MarketplaceOffer> | MarketplaceOffer[]>(
      `/shipment-requests/${requestId}/offers/`
    );
    return getResults(response);
  },

  createOffer: (requestId: number, payload: CreateOfferPayload): Promise<MarketplaceOffer> =>
    apiClient.post<MarketplaceOffer>(`/shipment-requests/${requestId}/offers/`, payload),

  counterOffer: (offerId: number, amount: number) =>
    apiClient.post(`/offers/${offerId}/counter/`, { amount }),

  acceptOffer: (offerId: number) =>
    apiClient.post(`/offers/${offerId}/accept/`, { accepted: true }),

  rejectOffer: (offerId: number, reason?: string) =>
    apiClient.post<MarketplaceOffer>(`/offers/${offerId}/reject/`, { reason: reason ?? '' }),

  listMyOffers: async (): Promise<MarketplaceOfferWithRequest[]> => {
    const requests = await marketplaceApi.listMyRequests();
    const grouped = await Promise.all(requests.map(async (request) => {
      const offers = await marketplaceApi.listOffers(request.id);
      return offers.map((offer) => ({ request, offer }));
    }));
    return grouped.flat();
  },
};
