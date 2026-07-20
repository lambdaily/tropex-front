import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { marketplaceApi } from '../api/marketplaceApi';

export const MARKETPLACE_QUERY_KEY = ['transport-marketplace'] as const;

export function useAvailableTransportRequests() {
  return useQuery({
    queryKey: [...MARKETPLACE_QUERY_KEY, 'available-requests'],
    queryFn: marketplaceApi.listAvailableRequests,
    staleTime: 30 * 1000,
  });
}

export function useRancherOffers() {
  return useQuery({
    queryKey: [...MARKETPLACE_QUERY_KEY, 'rancher-offers'],
    queryFn: marketplaceApi.listMyOffers,
    staleTime: 30 * 1000,
  });
}

export function useCreateTransportOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, amount, guideId, pricePerKm }: {
      requestId: number;
      amount: number;
      guideId?: number | null;
      pricePerKm?: number | null;
    }) => marketplaceApi.createOffer(requestId, {
      amount,
      guide: guideId ?? null,
      price_per_km: pricePerKm ?? null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...MARKETPLACE_QUERY_KEY, 'available-requests'] });
      queryClient.invalidateQueries({ queryKey: [...MARKETPLACE_QUERY_KEY, 'rancher-offers'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}

export function useCounterOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, amount }: { offerId: number; amount: number }) =>
      marketplaceApi.counterOffer(offerId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...MARKETPLACE_QUERY_KEY, 'rancher-offers'] });
    },
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: number) => marketplaceApi.acceptOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...MARKETPLACE_QUERY_KEY, 'rancher-offers'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}

export function useRejectOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, reason }: { offerId: number; reason?: string }) =>
      marketplaceApi.rejectOffer(offerId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...MARKETPLACE_QUERY_KEY, 'rancher-offers'] });
    },
  });
}
