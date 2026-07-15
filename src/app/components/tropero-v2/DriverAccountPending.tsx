import {Clock, LayoutDashboard, CheckCircle, User} from 'lucide-react';
import { SignupHeader } from './SignupHeader';

interface DriverAccountPendingProps {
  onGoToDashboard: () => void;
}

export function DriverAccountPending({ onGoToDashboard }: DriverAccountPendingProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1E8' }}>
            {/* Header */}
      <SignupHeader />

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Tu cuenta está casi lista
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            El administrador de tu empresa debe aprobar tu solicitud antes de que puedas empezar a operar
          </p>

          {/* Status Banner */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mb-8 text-left">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-700" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-yellow-900 text-lg mb-2">Pendiente de aprobación</h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Hemos notificado al administrador de tu empresa sobre tu solicitud de vinculación.
                  Recibirás una notificación cuando tu cuenta sea aprobada.
                </p>
                <div className="space-y-2 text-sm text-yellow-800">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Información personal verificada</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Solicitud enviada a tu empresa</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Esperando aprobación del administrador</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={onGoToDashboard}
              className="bg-black text-white rounded-xl p-6 hover:bg-gray-800 transition-all text-left group"
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold mb-1">Ir al panel</h3>
              <p className="text-sm text-gray-300">Explora tu dashboard mientras esperás</p>
            </button>

            <button
              onClick={onGoToDashboard}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all text-left group"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="w-5 h-5 text-gray-700" />
              </div>
              <h3 className="font-bold text-black mb-1">Completar perfil</h3>
              <p className="text-sm text-gray-600">Agregar más detalles (opcional)</p>
            </button>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-left mb-8">
            <h4 className="font-semibold text-blue-900 mb-3 text-lg">Qué podés hacer mientras esperás</h4>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 text-white rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: '#1E5126' }}>
                  1
                </div>
                <div>
                  <p className="font-medium mb-1">Explorar tu panel de control</p>
                  <p className="text-blue-700">Familiarizate con la interfaz y las funciones disponibles</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 text-white rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: '#1E5126' }}>
                  2
                </div>
                <div>
                  <p className="font-medium mb-1">Completar tu perfil</p>
                  <p className="text-blue-700">Agregá información adicional que te ayude a destacar</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 text-white rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: '#1E5126' }}>
                  3
                </div>
                <div>
                  <p className="font-medium mb-1">Revisar la documentación</p>
                  <p className="text-blue-700">Aprendé sobre cómo funciona TROPEX y las mejores prácticas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            onClick={onGoToDashboard}
            className="w-full px-8 py-5 bg-black text-white font-bold text-lg rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
          >
            Ir al Panel de Control
          </button>

          {/* Info text */}
          <p className="text-sm text-gray-600 mt-6">
            El tiempo de aprobación depende de tu empresa. Por lo general, esto puede tomar entre unas horas hasta 2 días hábiles.
          </p>
        </div>
      </main>
    </div>
  );
}
