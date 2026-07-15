import { useState } from 'react';
import { Beef, ChevronLeft, Key, Building2, X, Info } from 'lucide-react';

import type { SignupData } from '../../types/signup';
interface DriverSignup2MobileProps {
  onNext: (data: Partial<SignupData>) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function DriverSignup2CompanyMobile({ onNext, onSkip, onBack }: DriverSignup2MobileProps) {
  const [formData, setFormData] = useState({ invitationCode: '', companyName: '' });
  const [showInfo, setShowInfo] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
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
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: i <= 2 ? '#F58718' : 'rgba(255,255,255,0.25)' }} />
          ))}
        </div>
        <p className="text-white/60 text-xs mt-1">Paso 2 de 3 — Empresa asignada</p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Empresa asignada</h1>
        <p className="text-gray-500 text-sm mb-7">Información de la empresa para la que trabajás</p>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>¿Tenés un código de invitación?</strong> Tu empleador debería haberte dado un código para vincular tu cuenta.
          </p>
        </div>

        <form id="drv2-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Key className="w-4 h-4 text-gray-600" />
              <label className="text-sm font-semibold text-gray-800">Código de invitación <span className="font-normal text-gray-400">(opcional)</span></label>
            </div>
            <input
              type="text"
              value={formData.invitationCode}
              onChange={(e) => setFormData({ invitationCode: e.target.value, companyName: e.target.value ? '' : formData.companyName })}
              placeholder="Ej: TROPE-2024-ABC123"
              disabled={!!formData.companyName}
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126] disabled:bg-gray-100 disabled:text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">Si no tenés código, ingresá el nombre de la empresa</p>
          </div>

          <div className="relative flex items-center">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3 text-xs text-gray-400 uppercase">o ingresá manualmente</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Building2 className="w-4 h-4 text-gray-600" />
              <label className="text-sm font-semibold text-gray-800">
                Nombre de la empresa {!formData.invitationCode && <span className="text-red-500">*</span>}
              </label>
              <button type="button" onClick={() => setShowInfo(true)} className="ml-auto">
                <Info className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ companyName: e.target.value, invitationCode: e.target.value ? '' : formData.invitationCode })}
              placeholder="Ej: Transportes Ganaderos del Chaco S.A."
              required={!formData.invitationCode}
              disabled={!!formData.invitationCode}
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126] disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Verificaremos que la empresa esté registrada antes de aprobar tu cuenta.
            </p>
          </div>
        </form>
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100">
        <button type="submit" form="drv2-form" className="w-full py-4 text-white font-bold text-base rounded-2xl" style={{ backgroundColor: '#1E5126' }}>
          Continuar
        </button>
      </div>

      {showInfo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">Sobre el nombre de la empresa</h3>
              <button onClick={() => setShowInfo(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-700 mb-4">Ingresá el nombre de tu empresa manualmente. Asegurate de escribirlo correctamente para que podamos verificar que esté registrada en TROPEX.</p>
            <button onClick={() => setShowInfo(false)} className="w-full py-4 text-white font-bold rounded-2xl" style={{ backgroundColor: '#1E5126' }}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
