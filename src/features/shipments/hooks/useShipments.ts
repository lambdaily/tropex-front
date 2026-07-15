import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { shipmentsApi, type CreateShipmentPayload } from '../api/shipmentsApi';
import type { ShipmentRequest } from '../types/shipment.types';

const SHIPMENTS_QUERY_KEY = ['shipments'] as const;

export function useShipments() {
  return useQuery({
    queryKey: [...SHIPMENTS_QUERY_KEY],
    queryFn: () => shipmentsApi.list(),
    staleTime: 60 * 1000,
  });
}

export function useShipment(id: number) {
  return useQuery({
    queryKey: [...SHIPMENTS_QUERY_KEY, id],
    queryFn: () => apiClient.get<ShipmentRequest>(`/shipment-requests/${id}/`),
    enabled: !!id,
  });
}

export function useActiveShipments() {
  return useQuery({
    queryKey: [...SHIPMENTS_QUERY_KEY, 'active'],
    queryFn: () => shipmentsApi.list().then((all) =>
      all.filter((s) => s.status === 'new' || s.status === 'partial' || s.status === 'accepted')
    ),
    staleTime: 60 * 1000,
  });
}

export function useShipmentsWithoutOffer() {
  return useQuery({
    queryKey: [...SHIPMENTS_QUERY_KEY, 'no-offer'],
    queryFn: () => shipmentsApi.list().then((all) =>
      all.filter((s) => s.status === 'new' && s.guides.every((g) => g.status === 'available'))
    ),
    staleTime: 60 * 1000,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShipmentPayload) => shipmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...SHIPMENTS_QUERY_KEY] });
    },
  });
}

export type { ShipmentRequest };
