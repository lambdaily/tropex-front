import { useState } from 'react';
import { Beef, ChevronLeft, Upload, Shield, CheckCircle } from 'lucide-react';

interface EmpresaSignup3MobileProps {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export function EmpresaSignup3DocumentsMobile({ onNext, onSkip, onBack }: EmpresaSignup3MobileProps) {
  const [senascaPermit, setSenascaPermit] = useState<File | null>(null);

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
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: i <= 3 ? '#F58718' : 'rgba(255,255,255,0.25)' }} />
          ))}
        </div>
        <p className="text-white/60 text-xs mt-1">Paso 3 de 5 — Documentos</p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Documentos de la empresa</h1>
        <p className="text-gray-500 text-sm mb-7">Subí la habilitación SENACSA o completá después</p>

        <label className="block bg-white rounded-2xl border-2 border-dashed p-6 cursor-pointer mb-6" style={{ borderColor: senascaPermit ? '#1E5126' : '#d1d5db' }}>
          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setSenascaPermit(e.target.files?.[0] || null)} />
          <div className="flex flex-col items-center text-center gap-3">
            {senascaPermit ? (
              <>
                <CheckCircle className="w-10 h-10 text-green-600" />
                <p className="font-semibold text-sm text-gray-900">{senascaPermit.name}</p>
                <p className="text-xs text-green-600">Archivo cargado</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#1E512615' }}>
                  <Shield className="w-7 h-7" style={{ color: '#1E5126' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Habilitación de transporte SENACSA</p>
                  <p className="text-xs text-gray-400 mt-1">Tocá para subir · PDF, JPG o PNG (máx. 5MB)</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ borderColor: '#1E5126', color: '#1E5126' }}>
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-semibold">Seleccionar archivo</span>
                </div>
              </>
            )}
          </div>
        </label>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Revisión en 48 hs.</strong> Nuestro equipo verificará los documentos antes de aprobar tu cuenta.
          </p>
        </div>
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100 space-y-3">
        <button onClick={onNext} className="w-full py-4 text-white font-bold text-base rounded-2xl" style={{ backgroundColor: '#1E5126' }}>
          Continuar
        </button>
        <button onClick={onSkip} className="w-full py-3 text-sm font-medium text-gray-500 rounded-2xl border border-gray-200 bg-gray-50">
          Guardar para después
        </button>
      </div>
    </div>
  );
}
