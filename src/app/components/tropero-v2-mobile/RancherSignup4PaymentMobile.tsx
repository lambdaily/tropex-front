import { useState } from 'react';
import { Beef, ChevronLeft, Zap, Calendar, Settings } from 'lucide-react';

interface RancherSignup4MobileProps {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

const paymentOptions = [
  { id: 'instant', icon: Zap, title: 'Pago inmediato', description: 'Pagás al transportista al confirmar la entrega', badge: 'Recomendado', accentColor: '#1E5126' },
  { id: 'term', icon: Calendar, title: 'Pago a plazo', description: 'Configurá condiciones a 15, 30 o 60 días', accentColor: '#1d4ed8' },
  { id: 'later', icon: Settings, title: 'Configurar después', description: 'Definí tus preferencias de pago más adelante', accentColor: '#6b7280' },
];

export function RancherSignup4PaymentMobile({ onNext, onSkip, onBack }: RancherSignup4MobileProps) {
  const [selected, setSelected] = useState('');

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F6F1E8' }}>
      <header className="sticky top-0 z-10 px-4 pb-3 pt-3" style={{ backgroundColor: '#1E5126' }}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-1"><ChevronLeft className="w-6 h-6 text-white" /></button>
          <Beef className="w-5 h-5 text-white" />
          <span className="font-bold text-white text-lg">TROPEX</span>
          <button onClick={onSkip} className="ml-auto text-white/80 text-sm">Omitir</button>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full">
          <div className="h-full rounded-full" style={{ backgroundColor: '#F58718', width: '100%' }} />
        </div>
        <p className="text-white/60 text-xs mt-1">Paso 3 de 3 — Pago</p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Preferencias de pago</h1>
        <p className="text-gray-500 text-sm mb-7">¿Cómo preferís pagar a los transportistas?</p>

        <div className="space-y-3 mb-6">
          {paymentOptions.map(({ id, icon: Icon, title, description, badge, accentColor }) => {
            const isSelected = selected === id;
            return (
              <button
                key={id}
                onClick={() => setSelected(id)}
                className="w-full text-left rounded-2xl border-2 p-4 flex items-start gap-4 transition-all"
                style={{
                  borderColor: isSelected ? accentColor : '#e5e7eb',
                  backgroundColor: isSelected ? `${accentColor}08` : 'white',
                }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accentColor}18` }}>
                  <Icon className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm text-gray-900">{title}</p>
                    {badge && (
                      <span className="px-2 py-0.5 text-white text-xs font-semibold rounded-full" style={{ backgroundColor: accentColor }}>
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{description}</p>
                </div>
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: isSelected ? accentColor : '#d1d5db', backgroundColor: isSelected ? accentColor : 'white' }}
                >
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Pagos seguros en Guaraníes (₲)</strong> — TROPEX actúa como intermediario hasta confirmar la entrega.
          </p>
        </div>
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100 space-y-3">
        <button onClick={onNext} className="w-full py-4 text-white font-bold text-base rounded-2xl" style={{ backgroundColor: '#1E5126' }}>
          Finalizar registro
        </button>
        <button onClick={onSkip} className="w-full py-3 text-sm font-medium text-gray-500 rounded-2xl border border-gray-200 bg-gray-50">
          Configurar después
        </button>
      </div>
    </div>
  );
}
