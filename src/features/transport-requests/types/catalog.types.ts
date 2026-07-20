export interface CatalogOption {
  value: string;
  label: string;
}

export interface TransportEstablishment {
  id: number;
  name: string;
  code?: string;
  type?: string;
  department?: string;
  district?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  verified?: boolean;
}

export interface TruckTypeOption extends CatalogOption {
  max_heads?: number | null;
}

export interface CatalogListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
