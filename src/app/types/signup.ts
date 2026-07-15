// Tipos del flujo de registro (signup), antes manejados como `any`.

/**
 * Datos que se van acumulando a lo largo de los pasos de registro.
 * Todos los campos son opcionales: cada paso aporta los suyos y se mergean.
 */
export interface SignupData {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  companyName?: string;
  establishmentName?: string;
  email?: string;
  phone?: string;
  contactPhone?: string;
  password?: string;
  passwordConfirm?: string;
  ruc?: string;
  razonSocial?: string;
  idNumber?: string;
  cedula?: string;
  address?: string;
  institutionType?: string;
  institution?: string;
  accountNumber?: string;
  accountHolderName?: string;
  documentType?: string;
  documentNumber?: string;
  units?: unknown[];
  accessMap?: unknown;
  latitude?: string;
  longitude?: string;
  department?: string;
  city?: string;
  frequency?: string;
}

/** Parámetros de un link de referido (deep-link `?trip=...&referrer=...`). */
export interface ReferralParams {
  tripId: string;
  referrerName: string;
  remainingHeads: number;
  cattleType: string;
}
