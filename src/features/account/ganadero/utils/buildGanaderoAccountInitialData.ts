import type { UserData } from '@/features/auth';
import type {
  GanaderoAccountInitialData,
  GanaderoSignupSnapshot,
} from '../types/ganadero-account.types';

interface BuildGanaderoAccountInitialDataInput {
  user: UserData | null | undefined;
  signupData?: GanaderoSignupSnapshot;
  fallbackName?: string;
}

const DEFAULT_INITIAL_DATA: GanaderoAccountInitialData = {
  profile: {
    nombre: 'Usuario',
    telefono: 'No informado',
    email: 'No informado',
  },
  establishment: {
    nombre: 'Sin establecimiento',
    ruc: 'No informado',
    razonSocial: 'No informado',
    codigo: 'Sin código',
    departamento: 'No informado',
    ciudad: 'No informado',
  },
  payment: {
    summary: 'No configurado',
  },
};

function clean(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function fullNameFromUser(user: UserData | null | undefined): string | null {
  if (!user) return null;
  const first = clean(user.first_name);
  const last = clean(user.last_name);
  const full = [first, last].filter(Boolean).join(' ').trim();
  return full || null;
}

function maskAccountNumber(accountNumber: string | undefined): string | null {
  const raw = clean(accountNumber);
  if (!raw) return null;

  const onlyDigits = raw.replace(/\D/g, '');
  const tail = onlyDigits.slice(-4);

  if (!tail) return 'Cuenta configurada';
  return `Cta. ····${tail}`;
}

export function buildGanaderoAccountInitialData({
  user,
  signupData,
  fallbackName,
}: BuildGanaderoAccountInitialDataInput): GanaderoAccountInitialData {
  const profileName =
    fullNameFromUser(user)
    ?? clean(signupData?.fullName)
    ?? clean(signupData?.firstName)
    ?? clean(fallbackName)
    ?? DEFAULT_INITIAL_DATA.profile.nombre;

  const profilePhone =
    clean(user?.phone)
    ?? clean(signupData?.phone)
    ?? DEFAULT_INITIAL_DATA.profile.telefono;

  const profileEmail =
    clean(user?.email)
    ?? clean(signupData?.email)
    ?? DEFAULT_INITIAL_DATA.profile.email;

  const establishmentName =
    clean(signupData?.establishmentName)
    ?? DEFAULT_INITIAL_DATA.establishment.nombre;

  const establishmentRuc =
    clean(user?.ruc)
    ?? clean(signupData?.ruc)
    ?? DEFAULT_INITIAL_DATA.establishment.ruc;

  const establishmentLegalName =
    clean(user?.legal_name)
    ?? clean(signupData?.razonSocial)
    ?? DEFAULT_INITIAL_DATA.establishment.razonSocial;

  const establishmentDepartment =
    clean(signupData?.department)
    ?? DEFAULT_INITIAL_DATA.establishment.departamento;

  const establishmentCity =
    clean(signupData?.city)
    ?? DEFAULT_INITIAL_DATA.establishment.ciudad;

  const institution = clean(signupData?.institution);
  const maskedAccount = maskAccountNumber(signupData?.accountNumber);
  const paymentSummary =
    institution && maskedAccount
      ? `${institution} · ${maskedAccount}`
      : institution
        ?? maskedAccount
        ?? DEFAULT_INITIAL_DATA.payment.summary;

  return {
    profile: {
      nombre: profileName,
      telefono: profilePhone,
      email: profileEmail,
    },
    establishment: {
      nombre: establishmentName,
      ruc: establishmentRuc,
      razonSocial: establishmentLegalName,
      codigo: DEFAULT_INITIAL_DATA.establishment.codigo,
      departamento: establishmentDepartment,
      ciudad: establishmentCity,
    },
    payment: {
      summary: paymentSummary,
    },
  };
}
