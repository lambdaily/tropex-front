import { apiClient } from '@/shared/api/apiClient';
import type { CreateTransportRequestPayload } from '../types/transport-request.types';
import type { ShipmentRequest } from '@/features/shipments';

export const transportRequestsApi = {
  create: (payload: CreateTransportRequestPayload) =>
    apiClient.post<ShipmentRequest>('/shipment-requests/', payload),
};
