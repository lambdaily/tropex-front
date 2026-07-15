import { useState } from 'react';
import { Beef, ChevronLeft } from 'lucide-react';

import type { SignupData } from '../../types/signup';
interface ProductorSignup1MobileProps {
  onNext: (data: Partial<SignupData>) => void;
  onSkip: () => void;
  onBack: () => void;
  subTypeLabel?: string;
}

const rucDatabase: Record<string, string> = {
  '80012345-1': 'Establecimiento San Juan S.A.',
  '80023456-2': 'Frigorífico del Norte S.R.L.',
  '80034567-3': 'Consignataria Central S.A.',
  '80045678-4': 'Feria Ganadera del Este S.R.L.',
};

export function ProductorSignup1BasicMobile({ onNext, onSkip, onBack, subTypeLabel = 'Productor' }: ProductorSignup1MobileProps) {
  const [formData, setFormData] = useState({ establishmentName: '', ruc: '', razonSocial: '', phone: '', email: '', address: '', password: '', passwordConfirm: '' });
  const [rucStatus, setRucStatus] = useState<'idle' | 'found' | 'not-found'>('idle');
  const [passwordError, setPasswordError] = useState('');

  const handleRucChange = (value: string) => {
    setFormData((prev) => ({ ...prev, ruc: value, razonSocial: '' }));
    setRucStatus('idle');
    if (value.length >= 8) {
      const found = rucDatabase[value];
      if (found) {
        setFormData((prev) => ({ ...prev, ruc: value, razonSocial: found }));
        setRucStatus('found');
      } else {
        setRucStatus('not-found');
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
        <p className="text-white/60 text-xs mt-1">Paso 1 de 3 — Información básica</p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Información del establecimiento</h1>
        <p className="text-gray-500 text-sm mb-7">Registrá tu perfil como <strong>{subTypeLabel}</strong></p>

        <form id="prod1-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Nombre del establecimiento *</label>
            <input type="text" value={formData.establishmentName} onChange={(e) => setFormData((p) => ({ ...p, establishmentName: e.target.value }))} placeholder="Ej: Estancia La Esperanza" required className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">RUC *</label>
            <input type="text" value={formData.ruc} onChange={(e) => handleRucChange(e.target.value)} placeholder="Ej: 80012345-1" required className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]" />
            {rucStatus === 'found' && <p className="text-xs mt-1 font-medium" style={{ color: '#1E5126' }}>✓ RUC verificado</p>}
            {rucStatus === 'not-found' && <p className="text-xs text-amber-600 mt-1">RUC no encontrado — podés continuar igual</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Razón social</label>
            <input type="text" value={formData.razonSocial} onChange={(e) => setFormData((p) => ({ ...p, razonSocial: e.target.value }))} placeholder="Se completa automáticamente con el RUC" className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:border-[#1E5126]" style={{ backgroundColor: rucStatus === 'found' ? '#f0fdf4' : 'white', borderColor: '#d1d5db' }} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Teléfono *</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} placeholder="+595 981 123 456" required className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email *</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} placeholder="ejemplo@empresa.com" required className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Dirección <span className="font-normal text-gray-400">(opcional)</span></label>
            <input type="text" value={formData.address} onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))} placeholder="Ej: Ruta 9, km 415, Filadelfia" className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Contrasena *</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} placeholder="Minimo 8 caracteres" required className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Confirmar Contrasena *</label>
            <input type="password" value={formData.passwordConfirm} onChange={(e) => setFormData((p) => ({ ...p, passwordConfirm: e.target.value }))} placeholder="Repetir contrasena" required className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]" />
            {passwordError && <p className="text-xs text-red-600 mt-1">{passwordError}</p>}
          </div>
        </form>
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100">
        <button type="submit" form="prod1-form" disabled={!isValid} className="w-full py-4 text-white font-bold text-base rounded-2xl disabled:opacity-40" style={{ backgroundColor: '#1E5126' }}>
          Continuar
        </button>
      </div>
    </div>
  );
}
