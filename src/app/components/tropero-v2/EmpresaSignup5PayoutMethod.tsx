import { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {Clock, Zap, Info} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { SignupHeader } from './SignupHeader';

interface EmpresaSignup5PayoutMethodProps {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export function EmpresaSignup5PayoutMethod({ onNext, onSkip, onBack }: EmpresaSignup5PayoutMethodProps) {
  const [payoutMethod, setPayoutMethod] = useState('delayed');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', backgroundColor: '#F6F1E8' }}>
            {/* Header */}
      <SignupHeader onBack={onBack} onSkip={onSkip} />

      {/* Progress */}
      <div className="max-w-2xl mx-auto w-full px-6 py-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: '#1E5126' }}></div>
          <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: '#1E5126' }}></div>
          <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: '#1E5126' }}></div>
          <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: '#1E5126' }}></div>
          <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: '#1E5126' }}></div>
        </div>
        <p className="text-sm text-gray-600">Paso 5 de 5</p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <button
            onClick={onBack}
            className="text-sm hover:text-gray-600 mb-6"
            style={{ color: '#1E5126' }}
          >
            ← Volver
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Método de Cobro</h1>
            <p className="text-gray-600">
              Elegí cómo querés recibir tus pagos después de cada viaje
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <RadioGroup value={payoutMethod} onValueChange={setPayoutMethod}>
                <div className="space-y-4">
                  {/* Option 1 - Delayed Payment (Free) */}
                  <Label
                    htmlFor="delayed"
                    className={`border-2 rounded-xl p-5 cursor-pointer transition-all flex items-start gap-4 ${
                      payoutMethod === 'delayed'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <RadioGroupItem value="delayed" id="delayed" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 cursor-pointer mb-2">
                          <Clock className="w-5 h-5" style={{ color: '#1E5126' }} />
                          <span className="font-bold text-lg">Pago estándar</span>
                          <span className="ml-auto px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            3% COMISIÓN
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">
                          Recibís el pago cuando el ganadero libere los fondos después del viaje completado
                        </p>
                        <div className="bg-white border border-green-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-green-700 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-green-800">
                              <p className="font-medium mb-1">✓ 3% de comisión</p>
                              <p>El ganadero tiene hasta 24 horas para confirmar la entrega. TROPEX actúa como intermediario para garantizar el pago.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                  </Label>

                  {/* Option 2 - Instant Payment (2% fee) */}
                  <Label
                    htmlFor="instant"
                    className={`border-2 rounded-xl p-5 cursor-pointer transition-all flex items-start gap-4 ${
                      payoutMethod === 'instant'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <RadioGroupItem value="instant" id="instant" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 cursor-pointer mb-2">
                          <Zap className="w-5 h-5 text-yellow-600" />
                          <span className="font-bold text-lg">Pago inmediato</span>
                          <span className="ml-auto px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                            5% COMISIÓN
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">
                          Recibís el pago de inmediato al terminar el viaje, sin esperar a que el ganadero libere los fondos
                        </p>
                        <div className="bg-white border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-yellow-700 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-yellow-800">
                              <p className="font-medium mb-1">⚡ Liquidez instantánea</p>
                              <p>Se cobra un 5% de comisión total sobre el monto del viaje. TROPEX te paga directamente al completar el servicio.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Recordá:</strong> Podés cambiar esta preferencia en cualquier momento desde la configuración. También podés elegir método de cobro diferente para cada viaje.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              style={{ backgroundColor: '#1E5126' }}
            >
              Finalizar Registro
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}