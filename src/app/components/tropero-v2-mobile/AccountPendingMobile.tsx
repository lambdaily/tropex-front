import { Beef, Clock, FileText, Mail, Building2 } from 'lucide-react';
import { openWhatsApp } from '../../utils/contact';

interface AccountPendingMobileProps {
  userName?: string;
  userRole?: string;
  onLogout: () => void;
}

const roleLabels: Record<string, string> = {
  ganadero: 'Ganadero',
  empresa: 'Empresa de Transporte',
  'owner-operator': 'Transportista Independiente',
  chofer: 'Chofer',
};

export function AccountPendingMobile({ userName = 'Usuario', userRole = 'ganadero', onLogout }: AccountPendingMobileProps) {
  const roleName = roleLabels[userRole] ?? 'Usuario';

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F6F1E8' }}>
      <header className="sticky top-0 z-10 px-4 py-3" style={{ backgroundColor: '#1E5126' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Beef className="w-5 h-5 text-white" />
            <span className="font-bold text-white text-lg">TROPEX</span>
          </div>
          <button onClick={onLogout} className="px-3 py-1.5 text-sm font-medium rounded-lg text-white" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            Salir
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-8 pb-6">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Cuenta en Revisión</h1>
        <p className="text-gray-500 text-center text-sm mb-6">¡Bienvenido, {userName}!</p>

        <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #F59E0B' }}>
          <p className="text-amber-800 text-sm mb-3">
            Tu cuenta de <strong>{roleName}</strong> está siendo verificada. Este proceso puede tomar entre 24 a 48 horas.
          </p>
          <div className="bg-amber-100 h-2 rounded-full overflow-hidden">
            <div className="h-full w-2/5 rounded-full" style={{ backgroundColor: '#F58718' }} />
          </div>
          <p className="text-xs text-amber-700 mt-1.5">Revisión en progreso · Tiempo estimado: 24-48 hs</p>
        </div>

        <h2 className="font-semibold text-gray-900 mb-4">¿Qué estamos verificando?</h2>

        <div className="space-y-3 mb-6">
          {[
            { icon: FileText, label: 'Documentación', desc: 'Validando todos los documentos que subiste' },
            { icon: Mail, label: 'Email y Teléfono', desc: 'Confirmando tus datos de contacto' },
            { icon: Building2, label: 'Información Legal', desc: 'Verificando RUC y datos registrados con SENACSA' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 mb-4">
          <p className="text-sm text-gray-700">
            <strong>Te notificaremos por email y SMS</strong> cuando tu cuenta sea aprobada.
          </p>
        </div>

        <button
          onClick={() => openWhatsApp('595211234567')}
          className="w-full py-3 text-sm font-medium text-gray-600 rounded-2xl border border-gray-200 bg-white"
        >
          Consultar por WhatsApp
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">¿Dudas? soporte@tropero.com.py</p>
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100">
        <button onClick={onLogout} className="w-full py-4 text-sm font-bold text-gray-700 rounded-2xl border border-gray-300 bg-gray-50">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
