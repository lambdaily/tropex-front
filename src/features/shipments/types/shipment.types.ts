export type ShipmentStatus = 'new' | 'partial' | 'accepted' | 'cancelled';
export type OriginType = 'campo' | 'frigorifico' | 'feria' | 'otro' | 'mi_establecimiento';
export type DestinationType = 'frigorifico' | 'estancia' | 'feria' | 'campo' | 'otro' | 'mi_establecimiento';
export type CattleType = 'fat' | 'weaned';
export type GuideStatus = 'available' | 'in-negotiation' | 'accepted';
export type OfferStatus = 'pending' | 'rancher-countered' | 'accepted' | 'rejected';

export interface Guide {
  id: number;
  guide_number: number;
  heads: number;
  status: GuideStatus;
}

export interface ShipmentRequester {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface ShipmentRequest {
  id: number;
  requester: ShipmentRequester;
  origin: string;
  origin_department: string;
  origin_lat: string;
  origin_lng: string;
  origin_type: OriginType;
  destination: string;
  destination_type: DestinationType;
  destination_lat: string;
  destination_lng: string;
  cattle_type: CattleType;
  cattle_type_label: string;
  heads: number;
  estimated_weight_per_head: string | null;
  pickup_date: string;
  distance_km: string;
  notes: string;
  flexibility: string;
  status: ShipmentStatus;
  market_price: string | null;
  guides: Guide[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const SHIPMENT_STATUS_META: Record<ShipmentStatus, { label: string; color: string }> = {
  new: { label: 'Nueva', color: '#0ea5e9' },
  partial: { label: 'Parcial', color: '#F58718' },
  accepted: { label: 'Aceptada', color: '#1E5126' },
  cancelled: { label: 'Cancelada', color: '#dc2626' },
};

export const ORIGIN_TYPE_LABELS: Record<OriginType, string> = {
  campo: 'Campo/Estancia',
  frigorifico: 'Frigorífico',
  feria: 'Feria/Remate',
  otro: 'Otro',
  mi_establecimiento: 'Mi establecimiento',
};

export const DESTINATION_TYPE_LABELS: Record<DestinationType, string> = {
  frigorifico: 'Frigorífico',
  estancia: 'Estancia',
  feria: 'Feria/Remate',
  campo: 'Campo',
  otro: 'Otro',
  mi_establecimiento: 'Mi establecimiento',
};

export const CATTLE_TYPE_LABELS: Record<CattleType, string> = {
  fat: 'Gordos',
  weaned: 'Terneros/Desmamantes',
};
