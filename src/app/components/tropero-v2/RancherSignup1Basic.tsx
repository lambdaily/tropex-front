import { useState } from 'react';
import {Eye, EyeOff} from 'lucide-react';

import type { SignupData } from '../../types/signup';
import { SignupHeader } from './SignupHeader';
interface RancherSignup1Props {
  onNext: (data: Partial<SignupData>) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function RancherSignup1Basic({ onNext, onSkip, onBack }: RancherSignup1Props) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const errors: Record<string, string> = {};
  if (!formData.firstName.trim()) errors.firstName = 'Ingresa tu nombre';
  if (!formData.lastName.trim()) errors.lastName = 'Ingresa tu apellido';
  if (!formData.phone.trim()) errors.phone = 'Ingresa tu telefono';
  if (!formData.email.trim()) {
    errors.email = 'Ingresa tu email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Email no válido';
  }
  if (!formData.password) {
    errors.password = 'Ingresa una contrasena';
  } else if (formData.password.length < 8) {
    errors.password = 'Minimo 8 caracteres';
  }
  if (!formData.passwordConfirm) {
    errors.passwordConfirm = 'Confirma tu contrasena';
  } else if (formData.password !== formData.passwordConfirm) {
    errors.passwordConfirm = 'Las contrasenas no coinciden';
  }

  const isValid = Object.keys(errors).length === 0 && formData.password.length >= 8;

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const showError = (field: string) => touched[field] && errors[field];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = { firstName: true, lastName: true, phone: true, email: true, password: true, passwordConfirm: true };
    setTouched(allTouched);
    
    console.log('Form submitted', { formData, errors, isValid });
    
    if (!isValid) {
      console.log('Form has errors, not proceeding');
      return;
    }
    
    console.log('Form is valid, calling onNext');
    onNext(formData);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1E8' }}>
            {/* Header */}
      <SignupHeader onBack={onBack} onSkip={onSkip} />

      {/* Progress */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-900">Paso 1 de 3</span>
            <span className="text-sm text-gray-500">Información básica</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="h-1.5 rounded-full" style={{ backgroundColor: '#1E5126', width: '33.33%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-2">Información básica</h1>
          <p className="text-gray-600 mb-8">Completa tus datos principales</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  onBlur={() => handleBlur('firstName')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126] ${showError('firstName') ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Juan"
                />
                {showError('firstName') && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  onBlur={() => handleBlur('lastName')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126] ${showError('lastName') ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="González"
                />
                {showError('lastName') && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  onBlur={() => handleBlur('phone')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126] ${showError('phone') ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="+595 981 234 567"
                />
                {showError('phone') && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onBlur={() => handleBlur('email')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126] ${showError('email') ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="juan@ejemplo.com"
                />
                {showError('email') && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Contrasena *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onBlur={() => handleBlur('password')}
                    className={`w-full px-4 py-3 pr-11 border rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126] ${showError('password') ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Minimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {showError('password') && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Confirmar Contrasena *
                </label>
                <div className="relative">
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    value={formData.passwordConfirm}
                    onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                    onBlur={() => handleBlur('passwordConfirm')}
                    className={`w-full px-4 py-3 pr-11 border rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126] ${showError('passwordConfirm') ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Repetir contrasena"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {showError('passwordConfirm') && <p className="text-xs text-red-600 mt-1">{errors.passwordConfirm}</p>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-8 py-4 text-white font-semibold rounded-lg transition-colors"
                style={{ backgroundColor: '#1E5126' }}
              >
                Continuar
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="px-8 py-4 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Guardar y seguir después
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
