import { useState } from 'react';
import { Beef, ChevronLeft } from 'lucide-react';

import type { SignupData } from '../../types/signup';
interface OwnerOperatorSignup1MobileProps {
  onNext: (data: Partial<SignupData>) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function OwnerOperatorSignup1BasicMobile({ onNext, onSkip, onBack }: OwnerOperatorSignup1MobileProps) {
  const [formData, setFormData] = useState({ fullName: '', idNumber: '', ruc: '', phone: '', email: '', password: '', passwordConfirm: '' });
  const [passwordError, setPasswordError] = useState('');

  const isValid = formData.fullName && formData.idNumber && formData.ruc && formData.phone && formData.password.length >= 8 && formData.password === formData.passwordConfirm;

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
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F6F1E8' }}>
      <header className="sticky top-0 z-10 px-4 pb-3 pt-3" style={{ backgroundColor: '#1E5126' }}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-1"><ChevronLeft className="w-6 h-6 text-white" /></button>
          <Beef className="w-5 h-5 text-white" />
          <span className="font-bold text-white text-lg">TROPEX</span>
          <button onClick={onSkip} className="ml-auto text-white/80 text-sm">Omitir</button>
        </div>
        <div className="flex gap-1">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: i === 1 ? '#F58718' : 'rgba(255,255,255,0.25)' }} />
          ))}
        </div>
        <p className="text-white/60 text-xs mt-1">Paso 1 de 5 — Información personal</p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Información personal</h1>
        <p className="text-gray-500 text-sm mb-7">Registrate como transportista independiente</p>

        <form id="oo1-form" onSubmit={handleSubmit} className="space-y-5">
          {[
            { key: 'fullName', label: 'Nombre completo *', type: 'text', placeholder: 'Juan Carlos Pérez' },
            { key: 'idNumber', label: 'Cédula de identidad *', type: 'text', placeholder: '1.234.567' },
            { key: 'ruc', label: 'RUC *', type: 'text', placeholder: '12345678-9' },
            { key: 'phone', label: 'Celular *', type: 'tel', placeholder: '+595 981 123456' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'tu@email.com' },
            { key: 'password', label: 'Contrasena *', type: 'password', placeholder: 'Minimo 8 caracteres' },
            { key: 'passwordConfirm', label: 'Confirmar Contrasena *', type: 'password', placeholder: 'Repetir contrasena' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">{label}</label>
              <input
                type={type}
                value={formData[key as keyof typeof formData]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                placeholder={placeholder}
                required={label.includes('*')}
                className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
              />
              {key === 'passwordConfirm' && passwordError && <p className="text-xs text-red-600 mt-1">{passwordError}</p>}
            </div>
          ))}
        </form>
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100">
        <button type="submit" form="oo1-form" disabled={!isValid} className="w-full py-4 text-white font-bold text-base rounded-2xl disabled:opacity-40" style={{ backgroundColor: '#1E5126' }}>
          Continuar
        </button>
      </div>
    </div>
  );
}
