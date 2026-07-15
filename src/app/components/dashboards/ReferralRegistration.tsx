import { useState } from 'react';
import { Beef, CheckCircle2, Users, ArrowRight, Truck, Package } from 'lucide-react';
import { Button } from '../ui/button';

interface ReferralRegistrationProps {
  tripId: string;
  referrerName: string;
  remainingHeads: number;
  cattleType: string;
  onComplete: () => void;
}

import { toast } from 'sonner';
export function ReferralRegistration({
  tripId,
  referrerName,
  remainingHeads,
  cattleType,
  onComplete
}: ReferralRegistrationProps) {
  const [step, setStep] = useState<'info' | 'register' | 'bid'>('info');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    ruc: '',
    email: '',
  });
  const [bidCapacity, setBidCapacity] = useState(remainingHeads);

  const handleRegister = () => {
    // In real app, would call API to create account
    setStep('bid');
  };

  const handleSubmitBid = () => {
    // In real app, would call API to submit bid
    toast.success(`Oferta enviada por ${bidCapacity} cabezas con 0.5% de descuento!`);
    onComplete();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1E8' }} className="flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md">
              <Beef className="w-7 h-7" style={{ color: '#1E5126' }} />
            </div>
            <span className="text-3xl font-bold text-gray-900">TROPEX</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 'info' && '¡Te invitaron a un viaje!'}
            {step === 'register' && 'Completá tu registro'}
            {step === 'bid' && 'Hacé tu oferta'}
          </h1>
          <p className="text-gray-600">
            {step === 'info' && `${referrerName} te invitó a completar un viaje compartido`}
            {step === 'register' && 'Creá tu cuenta de transportista en TROPEX'}
            {step === 'bid' && 'Ofertá por las cabezas restantes del viaje'}
          </p>
        </div>

        {/* Info Step */}
        {step === 'info' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            {/* Referral Benefit */}
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-green-900 text-lg">Beneficio especial</h3>
              </div>
              <p className="text-green-800 text-lg font-semibold mb-2">
                0.5% de descuento en tu comisión
              </p>
              <p className="text-sm text-green-700">
                Por registrarte a través del link de {referrerName}, obtenés un descuento permanente en la comisión de este viaje.
              </p>
            </div>

            {/* Trip Info */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" style={{ color: '#1E5126' }} />
                Detalles del viaje
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">ID del viaje</div>
                  <div className="font-mono font-semibold text-gray-900">{tripId}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Tipo de ganado</div>
                  <div className="font-semibold text-gray-900">{cattleType}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Cabezas disponibles</div>
                  <div className="font-semibold text-gray-900 text-xl" style={{ color: '#1E5126' }}>
                    {remainingHeads}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Compartiendo con</div>
                  <div className="font-semibold text-gray-900">{referrerName}</div>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Cómo funciona</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#1E5126' }}>
                    1
                  </div>
                  <span className="text-sm text-gray-700">Registrate como transportista</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#1E5126' }}>
                    2
                  </div>
                  <span className="text-sm text-gray-700">Ofertá por las {remainingHeads} cabezas restantes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#1E5126' }}>
                    3
                  </div>
                  <span className="text-sm text-gray-700">Coordiná con {referrerName} para el viaje compartido</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full h-12 text-base"
              style={{ backgroundColor: '#1E5126' }}
              onClick={() => setStep('register')}
            >
              Comenzar registro
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Register Step */}
        {step === 'register' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              💡 Estás registrándote como <strong>Transportista Independiente</strong> (transportista con vehículo propio)
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Nombre completo *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="+595 981 123456"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                RUC *
              </label>
              <input
                type="text"
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="12345678-9"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep('info')}
              >
                Volver
              </Button>
              <Button
                className="flex-1 h-11"
                style={{ backgroundColor: '#1E5126' }}
                onClick={handleRegister}
                disabled={!formData.fullName || !formData.phone || !formData.ruc}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Bid Step */}
        {step === 'bid' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-900">Cuenta creada exitosamente</span>
              </div>
              <p className="text-sm text-green-800">
                Ahora podés ofertar por las cabezas restantes con tu descuento del 0.5%
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3">Cabezas disponibles para transportar</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Cabezas restantes del viaje</div>
                <div className="text-4xl font-bold mb-2" style={{ color: '#1E5126' }}>
                  {remainingHeads}
                </div>
                <div className="text-sm text-gray-600">{cattleType}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                ¿Cuántas cabezas querés transportar?
              </label>
              <input
                type="number"
                min="1"
                max={remainingHeads}
                value={bidCapacity}
                onChange={(e) => setBidCapacity(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
              <p className="text-xs text-gray-600 mt-1">
                Máximo: {remainingHeads} cabezas (las que quedan del viaje)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-xs text-blue-700 mb-1">Descuento por referido aplicado</div>
              <div className="text-lg font-bold text-blue-900">0.5% menos de comisión</div>
            </div>

            <Button
              className="w-full h-12 text-base"
              style={{ backgroundColor: '#1E5126' }}
              onClick={handleSubmitBid}
            >
              Enviar oferta por {bidCapacity} cabezas
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
