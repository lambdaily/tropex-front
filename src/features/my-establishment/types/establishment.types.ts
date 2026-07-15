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
