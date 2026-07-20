export interface MyEstablishment {
  id: number;
  name: string;
  code_sigor: string;
  owner_name: string;
  ruc: string;
  department: string;
  district: string;
  zonal_unit?: string;
  latitude: string | null;
  longitude: string | null;
  frequency: string;
}

export interface UpdateEstablishmentPayload {
  name?: string;
  owner_name?: string;
  ruc?: string;
  code_sigor?: string;
  department?: string;
  district?: string;
  frequency?: string;
  latitude?: string;
  longitude?: string;
}

export interface CreateEstablishmentPayload {
  senacsa_establishment_id?: number;
  establishment_name?: string;
  department?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  frequency?: string;
}

export interface SensitiveEstablishmentData {
  ruc: string;
  owner_name: string;
  department: string;
  district: string;
}

export interface CreateEstablishmentRequest {
  data: CreateEstablishmentPayload;
  sensitiveData: SensitiveEstablishmentData;
}
