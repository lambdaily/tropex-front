import { useState } from 'react';
import { validatePassword } from '@/shared/utils/passwordValidation';
import type { RancherSignupFormData, RancherSignupFormErrors } from '../types/rancher-signup.types';

export function useRancherSignupForm(initialData?: Partial<RancherSignupFormData>) {
  const [formData, setFormData] = useState<RancherSignupFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    password: initialData?.password || '',
    passwordConfirm: initialData?.passwordConfirm || '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (): RancherSignupFormErrors => {
    const errors: RancherSignupFormErrors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'Ingresa tu nombre';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Ingresa tu apellido';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Ingresa tu teléfono';
    }

    if (!formData.email.trim()) {
      errors.email = 'Ingresa tu email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      errors.password = passwordError;
    }

    if (!formData.passwordConfirm) {
      errors.passwordConfirm = 'Confirma tu contraseña';
    } else if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = 'Las contraseñas no coinciden';
    }

    return errors;
  };

  const errors = validate();
  const isValid = Object.keys(errors).length === 0;

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const showError = (field: string) => {
    return touched[field] && errors[field as keyof RancherSignupFormErrors];
  };

  const markAllTouched = () => {
    setTouched({
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      password: true,
      passwordConfirm: true,
    });
  };

  return {
    formData,
    setFormData,
    errors,
    isValid,
    handleBlur,
    showError,
    markAllTouched,
  };
}
