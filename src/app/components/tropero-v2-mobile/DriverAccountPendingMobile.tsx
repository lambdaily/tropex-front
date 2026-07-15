import { Beef, Clock, LayoutDashboard, CheckCircle, User } from 'lucide-react';

interface DriverAccountPendingMobileProps {
  onGoToDashboard: () => void;
}

export function DriverAccountPendingMobile({ onGoToDashboard }: DriverAccountPendingMobileProps) {
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
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-11 h-11 text-yellow-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Tu cuenta está casi lista</h1>
        <p className="text-gray-500 text-center text-sm mb-6">El administrador de tu empresa debe aprobar tu solicitud antes de que puedas empezar a operar</p>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5 mb-6">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-yellow-700" />
            </div>
            <div>
              <p className="font-bold text-yellow-900 mb-1">Pendiente de aprobación</p>
              <p className="text-sm text-yellow-800">Notificamos al administrador de tu empresa. Recibirás una notificación cuando seas aprobado.</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { done: true, label: 'Información personal verificada' },
              { done: true, label: 'Solicitud enviada a tu empresa' },
              { done: false, label: 'Esperando aprobación del administrador' },
            ].map(({ done, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-yellow-800">
                {done
                  ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  : <Clock className="w-4 h-4 flex-shrink-0" />
                }
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <button onClick={onGoToDashboard} className="w-full bg-black text-white rounded-2xl p-5 text-left">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold">Ir al panel</p>
            <p className="text-sm text-gray-300">Explorá tu dashboard mientras esperás</p>
          </button>

          <button onClick={onGoToDashboard} className="w-full bg-white border-2 border-gray-200 rounded-2xl p-5 text-left">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
              <User className="w-5 h-5 text-gray-700" />
            </div>
            <p className="font-bold text-gray-900">Completar perfil</p>
            <p className="text-sm text-gray-500">Agregá más detalles (opcional)</p>
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-4">
          <h4 className="font-semibold text-blue-900 mb-3">Qué podés hacer mientras esperás</h4>
          <div className="space-y-3">
            {[
              { n: 1, title: 'Explorar tu panel de control', desc: 'Familiarizate con la interfaz y las funciones disponibles' },
              { n: 2, title: 'Completar tu perfil', desc: 'Agregá información adicional que te ayude a destacar' },
              { n: 3, title: 'Revisar la documentación', desc: 'Aprendé sobre cómo funciona TROPEX y las mejores prácticas' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 text-white rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: '#1E5126' }}>
                  {n}
                </div>
                <div>
                  <p className="font-medium text-blue-900 text-sm">{title}</p>
                  <p className="text-xs text-blue-700">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">El tiempo de aprobación depende de tu empresa. Por lo general, puede tomar entre unas horas hasta 2 días hábiles.</p>
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100">
        <button onClick={onGoToDashboard} className="w-full py-4 bg-black text-white font-bold text-base rounded-2xl">
          Ir al Panel de Control
        </button>
      </div>
    </div>
  );
}
