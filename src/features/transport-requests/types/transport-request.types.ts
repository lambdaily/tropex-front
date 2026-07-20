import type { CatalogOption, TruckTypeOption, TransportEstablishment } from './catalog.types';

export type TransportRequestOriginType = 'campo' | 'frigorifico' | 'feria' | 'otro' | 'mi_establecimiento';
export type TransportRequestDestinationType = 'frigorifico' | 'estancia' | 'feria' | 'campo' | 'otro' | 'mi_establecimiento';

export interface TransportRequestLocation {
  establishment_id?: number;
  type: string;
  name: string;
  department?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface TransportRequestFormData {
  origin: TransportRequestLocation;
  destination: TransportRequestLocation;
  pickupDate: string;
  cattleType: string;
  cattleCount: string;
  estimatedWeight: string;
  specialNotes: string;
  truckType: string;
  flexibleWindow: string;
  additionalNotes: string;
  guide1Heads: string;
  guide2Heads: string;
}

export interface CreateTransportRequestPayload {
  origin: TransportRequestLocation;
  destination: TransportRequestLocation;
  pickup_date: string;
  cattle_type: string;
  cattle_type_label: string;
  heads: number;
  estimated_weight_per_head?: number;
  truck_type?: string;
  flexibility?: string;
  notes?: string;
  guides?: Array<{ guide_number: number; heads: number }>;
}

export interface TransportRequestCatalogs {
  originTypes: CatalogOption[];
  destinationTypes: CatalogOption[];
  cattleTypes: CatalogOption[];
  truckTypes: TruckTypeOption[];
  establishments: TransportEstablishment[];
}
