import { useState } from 'react';
import {Beef, ChevronRight, Building2, Truck, UserCheck, Store, Package} from 'lucide-react';
import { SignupHeader } from './SignupHeader';

interface ChooseAccountTypeProps {
  onSelectRole: (role: string) => void;
  onBack: () => void;
}

type Step = 'main' | 'productor' | 'transportista';

const productorOptions = [
  { role: 'ganadero', label: 'Ganadero / Estanciero', description: 'Productor con estancia o campo ganadero', icon: Beef },
  { role: 'frigorifico', label: 'Frigorífico', description: 'Planta de faena que necesita transporte de hacienda', icon: Building2 },
  // { role: 'consignataria', label: 'Consignataria', description: 'Empresa de corretaje y consignación de ganado', icon: Store },
  // { role: 'feria-remate', label: 'Feria / Remate', description: 'Organizador de subastas ganaderas', icon: Package },
  // { role: 'otro-productor', label: 'Otro', description: 'Otro tipo de establecimiento que necesita transporte', icon: UserCheck },
];

const transportistaOptions = [
  { role: 'empresa', label: 'Empresa', description: 'Compañía de transporte ganadero', icon: Building2 },
  { role: 'owner-operator', label: 'Transportista Independiente', description: 'Transportista independiente con vehículo propio', icon: Truck },
  { role: 'chofer', label: 'Chofer', description: 'Conductor empleado por una empresa', icon: UserCheck },
];

export function ChooseAccountType({ onSelectRole, onBack }: ChooseAccountTypeProps) {
  const [step, setStep] = useState<Step>('main');

  const handleBack = () => {
    if (step !== 'main') setStep('main');
    else onBack();
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F6F1E8' }}>
            {/* Header */}
      <SignupHeader onBack={handleBack} />

      <div className="flex-1 overflow-y-auto px-5 md:px-6 pt-8 md:py-12 pb-8">
        <div className="max-w-4xl mx-auto">

          {/* Step 1 — Main selection */}
          {step === 'main' && (
            <>
              {/* Mobile: left-aligned, Desktop: centered */}
              <div className="mb-8 md:mb-12 md:text-center">
                <h1 className="text-2xl md:text-4xl font-bold text-black mb-1 md:mb-3">¿Qué necesitás hacer?</h1>
                <p className="text-sm md:text-lg text-gray-600">Elegí tu rol en el transporte ganadero</p>
              </div>

              {/* Mobile: vertical stack horizontal cards, Desktop: 2-col grid vertical cards */}
              <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 md:max-w-2xl md:mx-auto">
                <button
                  onClick={() => setStep('productor')}
                  className="w-full bg-white border-2 rounded-2xl md:rounded-xl p-5 md:p-6 text-left transition-all hover:shadow-lg cursor-pointer flex items-center gap-4 md:flex-col md:items-start md:gap-0 active:bg-gray-50 md:active:bg-white"
                  style={{ borderColor: '#1E5126' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1E5126'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = window.innerWidth >= 768 ? 'rgb(229,231,235)' : '#1E5126'}
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center flex-shrink-0 mb-0 md:mb-5" style={{ backgroundColor: '#1E5126' }}>
                    <Beef className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="flex-1 md:flex-none">
                    <h3 className="font-bold text-black text-base md:text-xl mb-1 md:mb-2">Necesito transportar ganado</h3>
                    <p className="text-xs md:text-base text-gray-600">Ganadero, frigorífico, consignataria, feria u otro establecimiento productor</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 md:hidden" />
                </button>

                <button
                  onClick={() => setStep('transportista')}
                  className="w-full bg-white border-2 rounded-2xl md:rounded-xl p-5 md:p-6 text-left transition-all hover:shadow-lg cursor-pointer flex items-center gap-4 md:flex-col md:items-start md:gap-0 active:bg-gray-50 md:active:bg-white"
                  style={{ borderColor: '#F58718' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F58718'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = window.innerWidth >= 768 ? 'rgb(229,231,235)' : '#F58718'}
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center flex-shrink-0 mb-0 md:mb-5" style={{ backgroundColor: '#F58718' }}>
                    <Truck className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="flex-1 md:flex-none">
                    <h3 className="font-bold text-black text-base md:text-xl mb-1 md:mb-2">Soy transportista</h3>
                    <p className="text-xs md:text-base text-gray-600">Empresa, transportista independiente o chofer que presta servicios de flete ganadero</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 md:hidden" />
                </button>
              </div>
            </>
          )}

          {/* Step 2A — Productor sub-types */}
          {step === 'productor' && (
            <>
              <div className="mb-8 md:mb-10 md:text-center">
                <h1 className="text-2xl md:text-4xl font-bold text-black mb-1 md:mb-3">Tipo de establecimiento</h1>
                <p className="text-sm md:text-lg text-gray-600">Seleccioná el tipo que mejor te describe</p>
              </div>

              {/* Mobile: horizontal list cards, Desktop: 3-col grid */}
              <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:max-w-2xl md:mx-auto">
                {productorOptions.map(({ role, label, description, icon: Icon }) => (
                  <button
                    key={role}
                    onClick={() => onSelectRole(role)}
                    className="w-full bg-white border border-gray-200 md:border-2 rounded-2xl md:rounded-xl p-4 md:p-6 text-left transition-all hover:shadow-lg cursor-pointer flex items-center gap-4 md:flex-col md:items-start md:gap-0 active:bg-gray-50 md:active:bg-white"
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1E5126'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgb(229,231,235)'}
                  >
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 mb-0 md:mb-4" style={{ backgroundColor: '#1E512615' }}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#1E5126' }} />
                    </div>
                    <div className="flex-1 md:flex-none">
                      <p className="font-semibold text-black text-sm md:font-bold md:mb-2">{label}</p>
                      <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-0">{description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 md:hidden" />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 2B — Transportista sub-types */}
          {step === 'transportista' && (
            <>
              <div className="mb-8 md:mb-10 md:text-center">
                <h1 className="text-2xl md:text-4xl font-bold text-black mb-1 md:mb-3">Tipo de transportista</h1>
                <p className="text-sm md:text-lg text-gray-600">Seleccioná cómo operás</p>
              </div>

              {/* Mobile: horizontal list cards, Desktop: 3-col grid */}
              <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-4 md:max-w-2xl md:mx-auto">
                {transportistaOptions.map(({ role, label, description, icon: Icon }) => (
                  <button
                    key={role}
                    onClick={() => onSelectRole(role)}
                    className="w-full bg-white border border-gray-200 md:border-2 rounded-2xl md:rounded-xl p-4 md:p-6 text-left transition-all hover:shadow-lg cursor-pointer flex items-center gap-4 md:flex-col md:items-start md:gap-0 active:bg-gray-50 md:active:bg-white"
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F58718'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgb(229,231,235)'}
                  >
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 mb-0 md:mb-4" style={{ backgroundColor: '#F5871815' }}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#F58718' }} />
                    </div>
                    <div className="flex-1 md:flex-none">
                      <p className="font-semibold text-black text-sm md:font-bold md:mb-2">{label}</p>
                      <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-0">{description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 md:hidden" />
                  </button>
                ))}
              </div>
            </>
          )}

          <p className="text-center text-xs md:text-sm text-gray-500 mt-8">
            ¿No estás seguro? Podés cambiar tu tipo de cuenta más adelante.
          </p>
        </div>
      </div>
    </div>
  );
}
