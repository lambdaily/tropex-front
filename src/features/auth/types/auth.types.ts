export interface UserData {
  id: number;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  cedula: string | null;
  ruc: string | null;
  legal_name: string;
  sub_type: string;
  status: string;
  rating: number;
  trips_completed: number;
  documents: Record<string, {
    url: string;
    filename: string;
    uploaded_at: string;
    object_key?: string;
  }>;
  roles: string[];
  is_active: boolean;
  created_at: string;
}

export interface Tokens {
  access: string;
  refresh: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export type LoginResponse =
  | Tokens
  | {
      tokens: Tokens;
      user?: UserData;
    };

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone?: string;
  cedula?: string;
  ruc?: string;
  legal_name?: string;
  role_slug: string;
  sub_type?: string;
  // Establishment data (step 2)
  establishment_name?: string;
  latitude?: string;
  longitude?: string;
  department?: string;
  city?: string;
  frequency?: string;
  // Payment data (step 3)
  institution_type?: string;
  institution?: string;
  account_number?: string;
  account_holder_name?: string;
  document_type?: string;
  document_number?: string;
}

export interface AuthResponse {
  user: UserData;
  tokens: Tokens;
}

export interface RucVerification {
  valid: boolean;
  data?: {
    ruc: string;
    razon_social: string;
    estado: string;
    direccion: string;
    actividad_economica: string;
  };
  error?: string;
}

export interface RucVerificationReal {
  valid: boolean;
  data?: {
    ruc: string;
    razon_social: string;
    estado: string;
    esPersonaJuridica: boolean;
    esEntidadPublica: boolean;
  };
  error?: string;
}

export interface RoleOption {
  id: number;
  name: string;
  slug: string;
  description: string;
}
