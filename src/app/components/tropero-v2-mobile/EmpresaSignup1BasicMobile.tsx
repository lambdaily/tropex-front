import { useState } from 'react';
import { Beef, ChevronLeft } from 'lucide-react';

import type { SignupData } from '../../types/signup';
interface EmpresaSignup1MobileProps {
  onNext: (data: Partial<SignupData>) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function EmpresaSignup1BasicMobile({ onNext, onSkip, onBack }: EmpresaSignup1MobileProps) {
  const [formData, setFormData] = useState({ companyName: '', ruc: '', razonSocial: '', contactPhone: '', email: '', password: '', passwordConfirm: '' });
  const [passwordError, setPasswordError] = useState('');

  const isValid = formData.companyName && formData.ruc && formData.razonSocial && formData.contactPhone && formData.email && formData.password.length >= 8 && formData.password === formData.passwordConfirm;

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
        <p className="text-white/60 text-xs mt-1">Paso 1 de 5 — Información de la empresa</p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Información de la empresa</h1>
        <p className="text-gray-500 text-sm mb-7">Completá los datos de tu empresa de transporte</p>

        <form id="emp1-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Nombre de la empresa *</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="Ej: Transportes Ganaderos del Chaco S.A."
              required
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">RUC *</label>
            <input
              type="text"
              value={formData.ruc}
              onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
              placeholder="80045490-1"
              required
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
            />
            <p className="text-xs text-gray-400 mt-1">Verificá que el RUC sea correcto</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Razón Social *</label>
            <input
              type="text"
              value={formData.razonSocial}
              onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
              placeholder="Nombre legal de la empresa"
              required
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Teléfono *</label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="+595 981 123456"
              required
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email corporativo *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contacto@empresa.com.py"
              required
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

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100">
        <button type="submit" form="emp1-form" disabled={!isValid} className="w-full py-4 text-white font-bold text-base rounded-2xl disabled:opacity-40" style={{ backgroundColor: '#1E5126' }}>
          Continuar
        </button>
      </div>
    </div>
  );
}
