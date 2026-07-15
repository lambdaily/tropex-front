import { useState } from 'react';
import {AlertCircle} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

import type { SignupData } from '../../types/signup';
import { SignupHeader } from './SignupHeader';
interface OwnerOperatorSignup1BasicProps {
  onNext: (data: Partial<SignupData>) => void;
  onSkip: () => void;
  onBack: () => void;
  signupError?: string | null;
}

export function OwnerOperatorSignup1Basic({ onNext, onSkip, onBack, signupError }: OwnerOperatorSignup1BasicProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    ruc: '',
    phone: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [passwordError, setPasswordError] = useState('');

  const isValid =
    formData.fullName.trim() !== '' &&
    formData.idNumber.trim() !== '' &&
    formData.ruc.trim() !== '' &&
    formData.phone.trim() !== '' &&
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
            <h1 className="text-3xl font-bold mb-2">Información Personal</h1>
            <p className="text-gray-600">
              Registrate como transportista independiente con camión propio
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="fullName">Nombre Completo *</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Ej: Juan Carlos Pérez"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="idNumber">Cédula de Identidad *</Label>
              <Input
                id="idNumber"
                type="text"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                placeholder="1.234.567"
                required
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
                placeholder="12345678-9"
                required
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">Si emitís facturas</p>
            </div>

            <div>
              <Label htmlFor="phone">Número de Celular *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+595 981 123456"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@email.com"
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
