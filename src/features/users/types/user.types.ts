export type UserRole = 'ganadero' | 'empresa' | 'owner-operator' | 'chofer' | 'admin';
export type UserStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export interface UserMetrics {
  trips: number;
  gmv: number;
  rating?: number;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  legal_name: string | null;
  roles: string[];
  sub_type?: string | null;
  status: UserStatus | null;
  email: string;
  phone: string | null;
  ruc?: string | null;
  cedula?: string | null;
  address?: string;
  department?: string | null;
  rating: number | string | null;
  trips_completed: number | null;
  documents: Record<string, string> | null;
  is_active: boolean;
  created_at: string;
  establishments?: Array<{
    id: number;
    name: string;
    department?: string | null;
    district?: string | null;
  }>;
}

/** Extrae el primer rol del array `roles` y lo castea a `UserRole`. */
export function getUserRole(user: Pick<User, 'roles'>): UserRole {
  const role = user.roles[0] as UserRole | undefined;
  return role ?? 'ganadero';
}

/** Devuelve el status con fallback si el backend devuelve un valor inválido. */
export function getUserStatus(user: Pick<User, 'status'>): UserStatus {
  if (user.status && user.status in STATUS_META) {
    return user.status;
  }
  return 'pending';
}

export interface PaginatedUsers {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface UsersFilter {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export interface UserRoleMeta {
  label: string;
  color: string;
}

export interface UserStatusMeta {
  label: string;
  color: string;
}

export const ROLE_META: Record<UserRole, UserRoleMeta> = {
  ganadero: { label: 'Ganadero', color: '#1E5126' },
  empresa: { label: 'Empresa', color: '#F58718' },
  'owner-operator': { label: 'Transportista', color: '#08221A' },
  chofer: { label: 'Chofer', color: '#0ea5e9' },
  admin: { label: 'Administrador', color: '#dc2626' },
};

export const STATUS_META: Record<UserStatus, UserStatusMeta> = {
  active: { label: 'Activo', color: '#16a34a' },
  pending: { label: 'Pendiente', color: '#d97706' },
  suspended: { label: 'Suspendido', color: '#dc2626' },
  rejected: { label: 'Rechazado', color: '#6b7280' },
};

export const ROLE_LABELS: Record<string, string> = {
  ganadero: 'Ganadero',
  empresa: 'Empresa',
  'owner-operator': 'Transportista',
  chofer: 'Chofer',
  admin: 'Administrador',
  all: 'Todos los roles',
};

export const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  pending: 'Pendiente',
  suspended: 'Suspendido',
  rejected: 'Rechazado',
  all: 'Todos los estados',
};
