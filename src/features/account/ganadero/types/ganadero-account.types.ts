export interface GanaderoProfileData {
  nombre: string;
  telefono: string;
  email: string;
}

export interface GanaderoEstablishmentData {
  nombre: string;
  ruc: string;
  razonSocial: string;
  codigo: string;
  departamento: string;
  ciudad: string;
}

export interface GanaderoPaymentData {
  summary: string;
}

export interface GanaderoAccountInitialData {
  profile: GanaderoProfileData;
  establishment: GanaderoEstablishmentData;
  payment: GanaderoPaymentData;
}

export interface GanaderoSignupSnapshot {
  firstName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  establishmentName?: string;
  ruc?: string;
  razonSocial?: string;
  department?: string;
  city?: string;
  institution?: string;
  accountNumber?: string;
}
