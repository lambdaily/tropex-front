import { useState } from 'react';
import { Beef, ChevronLeft, Clock, Zap } from 'lucide-react';

interface EmpresaSignup5MobileProps {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export function EmpresaSignup5PayoutMethodMobile({ onNext, onSkip, onBack }: EmpresaSignup5MobileProps) {
  const [method, setMethod] = useState('delayed');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
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
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: '#F58718' }} />
          ))}
        </div>
        <p className="text-white/60 text-xs mt-1">Paso 5 de 5 — Método de cobro</p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Método de cobro</h1>
        <p className="text-gray-500 text-sm mb-7">¿Cómo querés recibir tus pagos después de cada viaje?</p>

        <form id="emp5-form" onSubmit={handleSubmit} className="space-y-4 mb-6">
          <button type="button" onClick={() => setMethod('delayed')} className="w-full text-left border-2 rounded-2xl p-5 transition-all" style={{ borderColor: method === 'delayed' ? '#1E5126' : '#e5e7eb', backgroundColor: method === 'delayed' ? '#f0fdf4' : 'white' }}>
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5" style={{ color: '#1E5126' }} />
              <span className="font-bold text-gray-900">Pago estándar</span>
              <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full text-white" style={{ backgroundColor: '#1E5126' }}>3% COMISIÓN</span>
            </div>
            <p className="text-sm text-gray-600">Recibís el pago cuando el ganadero libere los fondos tras el viaje</p>
          </button>

          <button type="button" onClick={() => setMethod('instant')} className="w-full text-left border-2 rounded-2xl p-5 transition-all" style={{ borderColor: method === 'instant' ? '#d97706' : '#e5e7eb', backgroundColor: method === 'instant' ? '#fffbeb' : 'white' }}>
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="font-bold text-gray-900">Pago inmediato</span>
              <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800">5% COMISIÓN</span>
            </div>
            <p className="text-sm text-gray-600">Recibís el pago de inmediato al terminar el viaje</p>
          </button>
        </form>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-sm text-blue-800">Podés cambiar esta preferencia en cualquier momento desde la configuración.</p>
        </div>
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100 space-y-3">
        <button type="submit" form="emp5-form" className="w-full py-4 text-white font-bold text-base rounded-2xl" style={{ backgroundColor: '#1E5126' }}>
          Finalizar registro
        </button>
        <button onClick={onSkip} className="w-full py-3 text-sm font-medium text-gray-500 rounded-2xl border border-gray-200 bg-gray-50">
          Guardar para después
        </button>
      </div>
    </div>
  );
}
