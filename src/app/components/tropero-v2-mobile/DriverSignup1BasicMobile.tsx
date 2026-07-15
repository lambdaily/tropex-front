import { useState } from 'react';
import { Beef, ChevronLeft } from 'lucide-react';

import type { SignupData } from '../../types/signup';
interface DriverSignup1MobileProps {
  onNext: (data: Partial<SignupData>) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function DriverSignup1BasicMobile({ onNext, onSkip, onBack }: DriverSignup1MobileProps) {
  const [formData, setFormData] = useState({ fullName: '', idNumber: '', phone: '', emergencyContact: '', email: '', password: '', passwordConfirm: '' });
  const [passwordError, setPasswordError] = useState('');

  const isValid = formData.fullName && formData.idNumber && formData.phone && formData.email && formData.password.length >= 8 && formData.password === formData.passwordConfirm;

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
          {[1,2,3].map((i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: i === 1 ? '#F58718' : 'rgba(255,255,255,0.25)' }} />
          ))}
        </div>
        <p className="text-white/60 text-xs mt-1">Paso 1 de 3 — Información personal</p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Información personal</h1>
        <p className="text-gray-500 text-sm mb-7">Registrate como chofer de una empresa de transporte</p>

        <form id="drv1-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Nombre completo *</label>
            <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Ej: Roberto Díaz" required className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Cédula de identidad *</label>
            <input type="text" value={formData.idNumber} onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })} placeholder="1.234.567" required className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Celular *</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+595 981 123456" required className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Contacto de emergencia <span className="font-normal text-gray-400">(opcional)</span></label>
            <input type="tel" value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} placeholder="+595 981 654321" className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]" />
            <p className="text-xs text-gray-400 mt-1">Número de un familiar o persona cercana</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email *</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="tu@email.com" required className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Contrasena *</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Minimo 8 caracteres" required className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Confirmar Contrasena *</label>
            <input type="password" value={formData.passwordConfirm} onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })} placeholder="Repetir contrasena" required className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]" />
            {passwordError && <p className="text-xs text-red-600 mt-1">{passwordError}</p>}
          </div>
        </form>
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100">
        <button type="submit" form="drv1-form" disabled={!isValid} className="w-full py-4 text-white font-bold text-base rounded-2xl disabled:opacity-40" style={{ backgroundColor: '#1E5126' }}>
          Continuar
        </button>
      </div>
    </div>
  );
}
