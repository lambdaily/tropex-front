import {CheckCircle, LayoutDashboard, Plus, User, Info} from 'lucide-react';
import { SignupHeader } from './SignupHeader';

interface AccountReadyProps {
  onGoToDashboard: () => void;
}

export function AccountReady({ onGoToDashboard }: AccountReadyProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1E8' }}>
            {/* Header */}
      <SignupHeader />

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12" style={{ color: '#1E5126' }} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Tu cuenta de TROPEX
            <br />
            está casi lista
          </h1>

          <p className="text-xl text-gray-600 mb-12">
            Ya puedes comenzar a explorar y crear solicitudes de transporte
          </p>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <button
              onClick={onGoToDashboard}
              className="text-white rounded-xl p-6 hover:opacity-90 transition-all text-left group"
              style={{ backgroundColor: '#1E5126' }}
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold mb-1">Ir al panel</h3>
              <p className="text-sm text-gray-300">Explora tu dashboard</p>
            </button>

            <button className="text-white rounded-xl p-6 transition-all text-left group" style={{ backgroundColor: '#F58718' }}>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold mb-1">Crear primer traslado</h3>
              <p className="text-sm text-green-100">Publica una solicitud</p>
            </button>

            <button className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all text-left group">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="w-5 h-5 text-gray-700" />
              </div>
              <h3 className="font-bold text-black mb-1">Completar perfil</h3>
              <p className="text-sm text-gray-600">Agregar más detalles</p>
            </button>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-8 text-left">
            <h3 className="font-bold text-black text-lg mb-4">Qué puedes hacer ahora</h3>
            <div className="space-y-0">
              <div className="flex gap-4 py-4">
                <div className="flex-shrink-0 w-8 h-8 text-white rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: '#1E5126' }}>
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-1">
                    Crear una solicitud de transporte
                  </h4>
                  <p className="text-sm text-gray-600">
                    Publica los detalles de tu traslado y recibe cotizaciones de transportistas verificados
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100"></div>

              <div className="flex gap-4 py-4">
                <div className="flex-shrink-0 w-8 h-8 text-white rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: '#1E5126' }}>
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-1">
                    Explorar transportistas disponibles
                  </h4>
                  <p className="text-sm text-gray-600">
                    Busca transportistas cerca de tu zona y revisa sus calificaciones
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100"></div>

              <div className="flex gap-4 py-4">
                <div className="flex-shrink-0 w-8 h-8 text-white rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: '#1E5126' }}>
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-1">
                    Completar tu perfil cuando quieras
                  </h4>
                  <p className="text-sm text-gray-600">
                    Agrega documentos y preferencias en cualquier momento desde tu panel
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 text-left mb-8">
            <div className="flex gap-3">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#1E5126' }} />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Activación completa</h4>
                <p className="text-sm text-blue-800">
                  Para recibir todas las funciones, completa tu perfil y sube los documentos 
                  requeridos cuando estés listo. Puedes hacerlo desde el panel de control.
                </p>
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            onClick={onGoToDashboard}
            className="w-full px-8 py-5 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-colors mb-3"
            style={{ backgroundColor: '#1E5126' }}
          >
            Ir al Panel de Control
          </button>

          {/* Secondary CTA */}
          <button
            onClick={onGoToDashboard}
            className="w-full border border-gray-300 rounded-xl py-4 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Completar perfil primero
          </button>
        </div>
      </main>
    </div>
  );
}