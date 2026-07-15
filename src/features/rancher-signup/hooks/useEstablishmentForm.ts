import { useState, useEffect, useCallback } from 'react';
import { useEstablishments } from './useEstablishments';
import type { AccessMapData, EstablishmentFormData, EstablishmentFormErrors } from '../types/rancher-signup.types';
import type { AutocompleteOption } from '@/app/components/ui/autocomplete-input';

export function useEstablishmentForm(initialData?: Partial<EstablishmentFormData>) {
  const [formData, setFormData] = useState<EstablishmentFormData>({
    establishmentName: initialData?.establishmentName || '',
    ruc: initialData?.ruc || '',
    razonSocial: initialData?.razonSocial || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    department: initialData?.department || '',
    city: initialData?.city || '',
    frequency: initialData?.frequency || '',
    accessMap: initialData?.accessMap || null,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useEstablishments();
  const establishmentOptions = data?.options ?? [];
  const establishments = data?.establishments ?? [];

  useEffect(() => {
    if (formData.ruc === '80069100-8' || formData.ruc === '800691008') {
      setFormData((prev) => ({
        ...prev,
        razonSocial: 'GANADERA LA JOYA SOCIEDAD ANONIMA',
      }));
    }
  }, [formData.ruc]);

  const validate = (): EstablishmentFormErrors => {
    const errors: EstablishmentFormErrors = {};

    if (!formData.ruc.trim()) {
      errors.ruc = 'Ingresa tu RUC';
    }

    if (!formData.razonSocial.trim()) {
      errors.razonSocial = 'Ingresa la razón social';
    }

    if (!formData.latitude || !formData.longitude) {
      errors.location = 'Selecciona una ubicación en el mapa';
    }

    return errors;
  };

  const errors = validate();
  const isValid = Object.keys(errors).length === 0;

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const showError = (field: string) => {
    return touched[field] && errors[field as keyof EstablishmentFormErrors];
  };

  const markAllTouched = () => {
    setTouched({
      ruc: true,
      razonSocial: true,
      location: true,
    });
  };

  const handleEstablishmentSelect = useCallback((option: AutocompleteOption) => {
    const selected = establishments.find((e) => e.establishmentName === option.name);
    setFormData((prev) => ({
      ...prev,
      establishmentName: option.name,
      department: selected?.department || prev.department,
      city: selected?.district || prev.city,
    }));
  }, [establishments]);

  const handleAccessMapUpload = (publicUrl: string, objectKey: string, filename: string) => {
    setFormData({ ...formData, accessMap: { publicUrl, objectKey, filename } });
  };

  const handleRemoveAccessMap = () => {
    setFormData({ ...formData, accessMap: null });
  };

  return {
    formData,
    setFormData,
    establishmentOptions,
    isLoadingEstablishments: isLoading,
    errors,
    isValid,
    handleBlur,
    showError,
    markAllTouched,
    handleEstablishmentSelect,
    handleAccessMapUpload,
    handleRemoveAccessMap,
  };
}
