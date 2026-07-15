import { Beef, XCircle, Mail, Phone } from 'lucide-react';

interface AccountRejectedMobileProps {
  userName?: string;
  userRole?: string;
  rejectionReason?: string;
  onResubmit: () => void;
  onLogout: () => void;
}

const roleLabels: Record<string, string> = {
  ganadero: 'Ganadero',
  empresa: 'Empresa de Transporte',
  'owner-operator': 'Transportista Independiente',
  chofer: 'Chofer',
};

export function AccountRejectedMobile({
  userName = 'Usuario',
  userRole = 'ganadero',
  rejectionReason = 'Los documentos proporcionados no cumplen con los requisitos necesarios.',
  onResubmit,
  onLogout,
}: AccountRejectedMobileProps) {
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
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Verificación No Completada</h1>
        <p className="text-gray-500 text-center text-sm mb-6">{userName}, necesitamos que revises tu solicitud de <strong>{roleName}</strong></p>

        <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #F87171' }}>
          <p className="text-red-800 font-medium text-sm mb-1">Motivo del rechazo:</p>
          <p className="text-red-700 text-sm">{rejectionReason}</p>
        </div>

        <h2 className="font-semibold text-gray-900 mb-4">¿Qué podés hacer?</h2>

        <div className="space-y-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 text-white rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: '#1E5126' }}>
              1
            </div>
            <div>
              <p className="text-sm text-gray-700 mb-2">Revisá los documentos que subiste y asegurate de que:</p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc ml-4">
                <li>Las imágenes sean claras y legibles</li>
                <li>Los documentos estén vigentes</li>
                <li>La información coincida con tus datos</li>
                <li>Todos los campos estén completos</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 text-white rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: '#1E5126' }}>
              2
            </div>
            <p className="text-sm text-gray-700">Corregí la información necesaria y volvé a enviar tu solicitud</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-2">
          <p className="text-sm text-gray-800 font-medium mb-3">¿Necesitás ayuda? Estamos disponibles</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span>soporte@tropero.com.py</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>+595 21 123 4567</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100 space-y-3">
        <button onClick={onResubmit} className="w-full py-4 text-white font-bold text-base rounded-2xl" style={{ backgroundColor: '#F58718' }}>
          Corregir y Reenviar
        </button>
        <button onClick={onLogout} className="w-full py-3 text-sm font-medium text-gray-600 rounded-2xl border border-gray-200 bg-gray-50">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
