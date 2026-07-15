import { useState } from 'react';
import {AlertCircle} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AutocompleteInput, AutocompleteOption } from '../ui/autocomplete-input';
import { transportCompaniesData } from '../../data/transport-companies-data';

import type { SignupData } from '../../types/signup';
import { SignupHeader } from './SignupHeader';
interface EmpresaSignup1BasicProps {
  onNext: (data: Partial<SignupData>) => void;
  onSkip: () => void;
  onBack: () => void;
  signupError?: string | null;
}

export function EmpresaSignup1Basic({ onNext, onSkip, onBack, signupError }: EmpresaSignup1BasicProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    ruc: '',
    razonSocial: '',
    contactPhone: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [passwordError, setPasswordError] = useState('');

  // Prepare autocomplete options from transport companies data
  const companyOptions: AutocompleteOption[] = transportCompaniesData.map((company) => ({
    code: company.ruc,
    name: company.companyName,
    display: `${company.companyName} - RUC: ${company.ruc}`,
  }));

  const handleCompanySelect = (option: AutocompleteOption) => {
    // Find the full company data
    const selectedCompany = transportCompaniesData.find(
      (c) => c.ruc === option.code && c.companyName === option.name
    );

    if (selectedCompany) {
      setFormData({
        ...formData,
        companyName: selectedCompany.companyName,
        ruc: selectedCompany.ruc,
        razonSocial: selectedCompany.companyName, // Auto-fill razón social with company name
      });
    }
  };

  const isValid =
    formData.companyName.trim() !== '' &&
    formData.ruc.trim() !== '' &&
    formData.razonSocial.trim() !== '' &&
    formData.contactPhone.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.password.length >= 8 &&
    formData.password === formData.passwordConfirm;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      setPasswordError('Las contrasenas no coinciden');
      return;
    }
    setPasswordError('');
    onNext(formData);
  };

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', backgroundColor: '#F6F1E8' }}>
            {/* Header */}
      <SignupHeader onBack={onBack} onSkip={onSkip} />

      {/* Progress */}
      <div className="max-w-2xl mx-auto w-full px-6 py-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: '#1E5126' }}></div>
          <div className="h-1.5 flex-1 bg-gray-200 rounded-full"></div>
          <div className="h-1.5 flex-1 bg-gray-200 rounded-full"></div>
          <div className="h-1.5 flex-1 bg-gray-200 rounded-full"></div>
          <div className="h-1.5 flex-1 bg-gray-200 rounded-full"></div>
        </div>
        <p className="text-sm text-gray-600">Paso 1 de 5</p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <button
            onClick={onBack}
            className="text-sm hover:text-gray-600 mb-6"
            style={{ color: '#1E5126' }}
          >
            ← Volver
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Información de la Empresa</h1>
            <p className="text-gray-600">
              Buscá tu empresa de transporte registrada o completá los datos manualmente
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Company Autocomplete */}
            <AutocompleteInput
              id="companySearch"
              label="Buscar empresa de transporte (opcional)"
              placeholder="Buscar por nombre... Ej: G-3 TRANSPORTES, AGRO LOG, BOICY"
              options={companyOptions}
              value={formData.companyName}
              onSelect={handleCompanySelect}
            />

            {/* Show info banner when company is selected */}
            {formData.companyName && formData.ruc && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  ✅ Empresa encontrada. Verifica que el RUC y la Razón Social sean correctos.
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="companyName">Nombre de la Empresa *</Label>
              <Input
                id="companyName"
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Ej: Transportes Ganaderos del Chaco S.A."
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="ruc">RUC *</Label>
              <Input
                id="ruc"
                type="text"
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                placeholder="80045490-1"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Verificá que el RUC sea correcto
              </p>
            </div>

            <div>
              <Label htmlFor="razonSocial">Razón Social *</Label>
              <Input
                id="razonSocial"
                type="text"
                value={formData.razonSocial}
                onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                placeholder="Nombre legal de la empresa"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Verificá que la razón social coincida con el RUC
              </p>
            </div>

            <div>
              <Label htmlFor="contactPhone">Teléfono de Contacto *</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+595 981 123456"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Corporativo *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contacto@empresa.com.py"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="password">Contrasena *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimo 8 caracteres"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="passwordConfirm">Confirmar Contrasena *</Label>
              <Input
                id="passwordConfirm"
                type="password"
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                placeholder="Repetir contrasena"
                required
                className="mt-1.5"
              />
              {passwordError && <p className="text-xs text-red-600 mt-1">{passwordError}</p>}
            </div>

            {/* Info message */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                💡 Si tu empresa está en la lista, buscala para autocompletar el nombre y RUC. Luego verificá la razón social.
              </p>
            </div>

            <Button
              type="submit"
              disabled={!isValid}
              className="w-full h-12 text-base"
              style={{ backgroundColor: '#1E5126' }}
            >
              Continuar
            </Button>

            {signupError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm" role="alert">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-800">No pudimos crear tu cuenta</p>
                  <p className="mt-0.5 whitespace-pre-line text-sm text-red-700">{signupError}</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
