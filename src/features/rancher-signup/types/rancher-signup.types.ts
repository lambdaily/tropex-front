export interface RancherSignupFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface RancherSignupFormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
}

export interface BasicInfoFormProps {
  onNext: (data: RancherSignupFormData) => void;
  onSkip: () => void;
  onBack: () => void;
  initialData?: Partial<RancherSignupFormData>;
  signupError?: string | null;
}

export interface AccessMapData {
  publicUrl: string;
  objectKey: string;
  filename: string;
}

export interface EstablishmentFormData {
  establishmentName: string;
  ruc: string;
  razonSocial: string;
  latitude: string;
  longitude: string;
  department: string;
  city: string;
  frequency: string;
  accessMap?: AccessMapData | null;
}

export interface EstablishmentFormErrors {
  ruc?: string;
  razonSocial?: string;
  location?: string;
}

export interface EstablishmentFormProps {
  onNext: (data: EstablishmentFormData) => void;
  onSkip?: () => void;
  onBack: () => void;
  initialData?: Partial<EstablishmentFormData>;
  signupError?: string | null;
}

export type InstitutionType = 'banco' | 'financiera' | 'cooperativa' | 'billetera' | null;

export interface PaymentFormData {
  institutionType: string;
  institution: string;
  accountNumber: string;
  accountHolderName: string;
  documentType: string;
  documentNumber: string;
}

export interface PaymentFormErrors {
  institutionType?: string;
  institution?: string;
  accountNumber?: string;
  accountHolderName?: string;
  documentType?: string;
  documentNumber?: string;
}

export interface PaymentFormProps {
  onNext: (data: PaymentFormData) => void;
  onSkip: () => void;
  onBack: () => void;
  initialData?: Partial<PaymentFormData>;
  signupError?: string | null;
}
