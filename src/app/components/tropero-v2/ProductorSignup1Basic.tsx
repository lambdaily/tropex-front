import { useState } from 'react';
import {AlertCircle} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

import type { SignupData } from '../../types/signup';
import { SignupHeader } from './SignupHeader';
interface ProductorSignup1BasicProps {
  onNext: (data: Partial<SignupData>) => void;
  onSkip: () => void;
  onBack: () => void;
  subTypeLabel?: string;
  signupError?: string | null;
}

// Simulated RUC → razón social lookup
const rucDatabase: Record<string, string> = {
  '80012345-1': 'Establecimiento San Juan S.A.',
  '80023456-2': 'Frigorífico del Norte S.R.L.',
  '80034567-3': 'Consignataria Central S.A.',
  '80045678-4': 'Feria Ganadera del Este S.R.L.',
};

export function ProductorSignup1Basic({ onNext, onSkip, onBack, subTypeLabel = 'Productor', signupError }: ProductorSignup1BasicProps) {
  const [formData, setFormData] = useState({
    establishmentName: '',
    ruc: '',
    razonSocial: '',
    phone: '',
    email: '',
    address: '',
    password: '',
    passwordConfirm: '',
  });
  const [rucLookupStatus, setRucLookupStatus] = useState<'idle' | 'found' | 'not-found'>('idle');
  const [passwordError, setPasswordError] = useState('');

  const handleRucChange = (value: string) => {
    setFormData(prev => ({ ...prev, ruc: value, razonSocial: '' }));
    setRucLookupStatus('idle');

    // Simulate turuc.com.py lookup on valid-looking RUC
    if (value.length >= 8) {
      const found = rucDatabase[value];
      if (found) {
        setFormData(prev => ({ ...prev, ruc: value, razonSocial: found }));
        setRucLookupStatus('found');
      } else {
        setRucLookupStatus('not-found');
      }
    }
  };

  const isValid = formData.establishmentName && formData.ruc && formData.phone && formData.email && formData.password.length >= 8 && formData.password === formData.passwordConfirm;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      setPasswordError('Las contrasenas no coinciden');
      return;
    }
    setPasswordError('');
    if (isValid) onNext(formData);
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
        </div>
        <p className="text-sm text-gray-600">Paso 1 de 3 — Información básica</p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <button onClick={onBack} className="text-sm mb-6 hover:text-gray-600" style={{ color: '#1E5126' }}>
            ← Volver
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Información del establecimiento</h1>
            <p className="text-gray-600">Registrá tu perfil como <strong>{subTypeLabel}</strong></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="establishmentName">Nombre del establecimiento *</Label>
              <Input
                id="establishmentName"
                value={formData.establishmentName}
                onChange={(e) => setFormData(prev => ({ ...prev, establishmentName: e.target.value }))}
                placeholder="Ej: Estancia La Esperanza"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="ruc">RUC *</Label>
              <Input
                id="ruc"
                value={formData.ruc}
                onChange={(e) => handleRucChange(e.target.value)}
                placeholder="Ej: 80012345-1"
                required
                className="mt-1.5"
              />
              {rucLookupStatus === 'found' && (
                <p className="text-xs mt-1" style={{ color: '#1E5126' }}>✓ RUC verificado en turuc.com.py</p>
              )}
              {rucLookupStatus === 'not-found' && (
                <p className="text-xs text-amber-600 mt-1">RUC no encontrado — podés continuar igual</p>
              )}
            </div>

            <div>
              <Label htmlFor="razonSocial">Razón social</Label>
              <Input
                id="razonSocial"
                value={formData.razonSocial}
                onChange={(e) => setFormData(prev => ({ ...prev, razonSocial: e.target.value }))}
                placeholder="Se completa automáticamente al ingresar RUC"
                className="mt-1.5"
                style={rucLookupStatus === 'found' ? { backgroundColor: '#f0fdf4', color: '#166534' } : {}}
              />
            </div>

            <div>
              <Label htmlFor="phone">Teléfono de contacto *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+595 981 123 456"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="ejemplo@empresa.com"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Ej: Ruta 9, km 415, Filadelfia"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="password">Contrasena *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, passwordConfirm: e.target.value }))}
                placeholder="Repetir contrasena"
                required
                className="mt-1.5"
              />
              {passwordError && <p className="text-xs text-red-600 mt-1">{passwordError}</p>}
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              style={{ backgroundColor: '#1E5126' }}
              disabled={!isValid}
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
