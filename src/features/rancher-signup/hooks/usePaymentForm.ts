import { useState } from 'react';
import { usePaymentInstitutions, EMPTY_INSTITUTIONS } from '@/features/payments';
import type { PaymentFormData, PaymentFormErrors, InstitutionType } from '../types/rancher-signup.types';

const documentTypes = [
  { label: 'Cédula de identidad', value: 'cedula' },
  { label: 'RUC', value: 'ruc' },
  { label: 'Pasaporte', value: 'pasaporte' },
  { label: 'Certificado de antecedentes', value: 'antecedentes' },
  { label: 'Libreta de baja', value: 'libreta_baja' },
  { label: 'Libreta cívica', value: 'libreta_civica' },
  { label: 'CRC - Documento extranjero', value: 'crc' },
  { label: 'CRP', value: 'crp' },
  { label: 'Nro asegurado IPS', value: 'nro_ips' },
  { label: 'Padrón caja jubilaciones', value: 'padron_jubilaciones' },
  { label: 'Registro de conducir', value: 'registro_conducir' },
];

const INSTITUTION_PLACEHOLDER: Record<Exclude<InstitutionType, null>, string> = {
  banco: 'Seleccione un banco',
  financiera: 'Seleccione una financiera',
  cooperativa: 'Seleccione una cooperativa',
  billetera: 'Seleccione una billetera',
};

export function usePaymentForm(initialData?: Partial<PaymentFormData>) {
  const [selectedType, setSelectedType] = useState<InstitutionType>(
    (initialData?.institutionType as InstitutionType) || null
  );

  const [formData, setFormData] = useState<PaymentFormData>({
    institutionType: initialData?.institutionType || '',
    institution: initialData?.institution || '',
    accountNumber: initialData?.accountNumber || '',
    accountHolderName: initialData?.accountHolderName || '',
    documentType: initialData?.documentType || '',
    documentNumber: initialData?.documentNumber || '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const queryResult = usePaymentInstitutions(selectedType ?? undefined);
  console.log('[usePaymentForm] queryResult:', {
    selectedType,
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
  });
  const institutions = queryResult.data;
  const isLoadingInstitutions = queryResult.isLoading;
  const isError = queryResult.isError;
  const safeInstitutions = institutions ?? EMPTY_INSTITUTIONS;

  const validate = (): PaymentFormErrors => {
    const errors: PaymentFormErrors = {};

    if (!formData.institutionType) {
      errors.institutionType = 'Selecciona un tipo de entidad';
    }

    if (!formData.institution) {
      errors.institution = 'Selecciona una institución';
    }

    if (!formData.accountNumber.trim()) {
      errors.accountNumber = 'Ingresa el número de cuenta';
    }

    if (!formData.accountHolderName.trim()) {
      errors.accountHolderName = 'Ingresa el nombre del titular';
    }

    if (!formData.documentType) {
      errors.documentType = 'Selecciona un tipo de documento';
    }

    if (!formData.documentNumber.trim()) {
      errors.documentNumber = 'Ingresa el número de documento';
    }

    return errors;
  };

  const errors = validate();
  const isValid = Object.keys(errors).length === 0;

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const showError = (field: string) => {
    return touched[field] && errors[field as keyof PaymentFormErrors];
  };

  const hasError = (field: keyof PaymentFormErrors) => Boolean(showError(field));

  const markAllTouched = () => {
    setTouched({
      institutionType: true,
      institution: true,
      accountNumber: true,
      accountHolderName: true,
      documentType: true,
      documentNumber: true,
    });
  };

  const handleTypeSelect = (type: InstitutionType) => {
    setSelectedType(type);
    setFormData({
      institutionType: type || '',
      institution: '',
      accountNumber: '',
      accountHolderName: '',
      documentType: '',
      documentNumber: '',
    });
    setTouched({});
  };

  const getInstitutionLabel = () => {
    if (!selectedType) return 'Seleccione una entidad';
    return INSTITUTION_PLACEHOLDER[selectedType];
  };

  return {
    formData,
    setFormData,
    selectedType,
    errors,
    isValid,
    handleBlur,
    hasError,
    markAllTouched,
    handleTypeSelect,
    institutions: safeInstitutions,
    isLoadingInstitutions,
    isError,
    getInstitutionLabel,
    documentTypes,
  };
}
