import { Beef, CheckCircle, LayoutDashboard, Plus, User, Info } from 'lucide-react';

interface AccountReadyMobileProps {
  onGoToDashboard: () => void;
}

export function AccountReadyMobile({ onGoToDashboard }: AccountReadyMobileProps) {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F6F1E8' }}>
      <header className="sticky top-0 z-10 px-4 py-3" style={{ backgroundColor: '#1E5126' }}>
        <div className="flex items-center gap-2">
          <Beef className="w-5 h-5 text-white" />
          <span className="font-bold text-white text-lg">TROPEX</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-8 pb-6">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-11 h-11" style={{ color: '#1E5126' }} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Tu cuenta de TROPEX está casi lista</h1>
        <p className="text-gray-500 text-center text-sm mb-8">Ya podés explorar y crear solicitudes de transporte</p>

        <div className="space-y-3 mb-8">
          <button
            onClick={onGoToDashboard}
            className="w-full text-white rounded-2xl p-5 text-left"
            style={{ backgroundColor: '#1E5126' }}
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold">Ir al panel</p>
            <p className="text-sm text-white/70">Explorá tu dashboard</p>
          </button>

          <button className="w-full text-white rounded-2xl p-5 text-left" style={{ backgroundColor: '#F58718' }}>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold">Crear primer traslado</p>
            <p className="text-sm text-orange-100">Publicá una solicitud</p>
          </button>

          <button className="w-full bg-white border-2 border-gray-200 rounded-2xl p-5 text-left">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
              <User className="w-5 h-5 text-gray-700" />
            </div>
            <p className="font-bold text-gray-900">Completar perfil</p>
            <p className="text-sm text-gray-500">Agregá más detalles</p>
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
          <h3 className="font-bold text-gray-900 mb-4">Qué podés hacer ahora</h3>
          <div className="space-y-0 divide-y divide-gray-100">
            {[
              { n: 1, title: 'Crear una solicitud de transporte', desc: 'Publicá los detalles y recibí cotizaciones de transportistas verificados' },
              { n: 2, title: 'Explorar transportistas disponibles', desc: 'Buscá transportistas cerca de tu zona y revisá sus calificaciones' },
              { n: 3, title: 'Completar tu perfil cuando quieras', desc: 'Agregá documentos y preferencias en cualquier momento desde tu panel' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-3 py-4">
                <div className="flex-shrink-0 w-7 h-7 text-white rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: '#1E5126' }}>
                  {n}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 mb-0.5">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-2">
          <div className="flex gap-3">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#1E5126' }} />
            <div>
              <p className="font-semibold text-blue-900 text-sm mb-1">Activación completa</p>
              <p className="text-xs text-blue-800">Para recibir todas las funciones, completá tu perfil y subí los documentos requeridos cuando estés listo.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100 space-y-3">
        <button onClick={onGoToDashboard} className="w-full py-4 text-white font-bold text-base rounded-2xl" style={{ backgroundColor: '#1E5126' }}>
          Ir al Panel de Control
        </button>
        <button onClick={onGoToDashboard} className="w-full py-3 text-sm font-medium text-gray-600 rounded-2xl border border-gray-200 bg-gray-50">
          Completar perfil primero
        </button>
      </div>
    </div>
  );
}
