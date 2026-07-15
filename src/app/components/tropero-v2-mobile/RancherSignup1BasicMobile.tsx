import { useState } from 'react';
import { Beef, ChevronLeft } from 'lucide-react';

import type { SignupData } from '../../types/signup';
interface RancherSignup1MobileProps {
  onNext: (data: Partial<SignupData>) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function RancherSignup1BasicMobile({ onNext, onSkip, onBack }: RancherSignup1MobileProps) {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '', passwordConfirm: '' });
  const [passwordError, setPasswordError] = useState('');

  const isValid = formData.firstName && formData.lastName && formData.phone && formData.email && formData.password.length >= 8 && formData.password === formData.passwordConfirm;

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
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ backgroundColor: '#F58718', width: '33%' }} />
        </div>
        <p className="text-white/60 text-xs mt-1">Paso 1 de 3 — Información básica</p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Información básica</h1>
        <p className="text-gray-500 text-sm mb-7">Completá tus datos principales</p>

        <form id="rancher1-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Nombre</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Juan"
                className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Apellido</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="González"
                className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+595 981 234 567"
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="juan@ejemplo.com"
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Contrasena *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimo 8 caracteres"
              required
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Confirmar Contrasena *</label>
            <input
              type="password"
              value={formData.passwordConfirm}
              onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
              placeholder="Repetir contrasena"
              required
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
            />
            {passwordError && <p className="text-xs text-red-600 mt-1">{passwordError}</p>}
          </div>
        </form>
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100 space-y-3">
        <button type="submit" form="rancher1-form" disabled={!isValid} className="w-full py-4 text-white font-bold text-base rounded-2xl disabled:opacity-40" style={{ backgroundColor: '#1E5126' }}>
          Continuar
        </button>
        <button onClick={onSkip} className="w-full py-3 text-sm font-medium text-gray-500 rounded-2xl border border-gray-200 bg-gray-50">
          Guardar y seguir después
        </button>
      </div>
    </div>
  );
}
