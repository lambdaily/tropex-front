import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import type { ShipmentRequest } from '@/features/shipments';

export interface CreateShipmentPayload {
  origin: string;
  origin_department: string;
  origin_lat: string;
  origin_lng: string;
  origin_type: 'campo' | 'frigorifico' | 'feria' | 'otro' | 'mi_establecimiento';
  destination: string;
  destination_type: 'frigorifico' | 'estancia' | 'feria' | 'campo' | 'otro' | 'mi_establecimiento';
  destination_lat: string;
  destination_lng: string;
  cattle_type: 'fat' | 'weaned';
  cattle_type_label: string;
  heads: number;
  pickup_date: string;
  distance_km: string;
  notes?: string;
  flexibility?: string;
  estimated_weight_per_head?: string;
}

export const shipmentsApi = {
  list: async (): Promise<ShipmentRequest[]> => {
    const response = await apiClient.get<{ count: number; next: string | null; previous: string | null; results: ShipmentRequest[] }>('/shipment-requests/');
    return response.results;
  },
  create: async (data: CreateShipmentPayload): Promise<ShipmentRequest> =>
    apiClient.post<ShipmentRequest>('/shipment-requests/', data),
};

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShipmentPayload) => shipmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}
