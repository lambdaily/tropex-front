export interface MyProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  cedula: string | null;
  ruc: string | null;
  legal_name: string;
  sub_type: string;
  status: string;
  rating: number;
  trips_completed: number;
  is_active: boolean;
  created_at: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}
