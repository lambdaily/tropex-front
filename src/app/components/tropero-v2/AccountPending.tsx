import { Button } from '../ui/button';
import {Clock, FileText, Mail, Phone, Building2} from 'lucide-react';
import { openWhatsApp } from '../../utils/contact';
import { SignupHeader } from './SignupHeader';

interface AccountPendingProps {
  userName?: string;
  userRole?: string;
  onLogout: () => void;
}

export function AccountPending({
  userName = 'Usuario',
  userRole = 'ganadero',
  onLogout
}: AccountPendingProps) {
  const getRoleName = () => {
    switch (userRole) {
      case 'ganadero':
        return 'Ganadero';
      case 'empresa':
        return 'Empresa de Transporte';
      case 'owner-operator':
        return 'Transportista Independiente';
      case 'chofer':
        return 'Chofer';
      default:
        return 'Usuario';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1E8' }}>
            {/* Header */}
      <SignupHeader onLogout={onLogout} />

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>

          <h1 className="text-3xl font-bold mb-3">Cuenta en Revisión</h1>
          <p className="text-lg text-gray-600 mb-6">
            ¡Bienvenido, {userName}!
          </p>

          <div className="border-l-4 border-amber-400 bg-amber-50 rounded-lg p-5 mb-6">
            <p className="text-amber-800">
              Tu cuenta de <span className="font-medium">{getRoleName()}</span> está siendo
              verificada por nuestro equipo. Este proceso puede tomar entre 24 a 48 horas.
            </p>
            <div className="mt-3">
              <div className="bg-amber-100 h-2 rounded-full overflow-hidden">
                <div className="h-full w-[40%]" style={{ backgroundColor: '#F58718' }}></div>
              </div>
              <p className="text-xs text-amber-700 mt-2">Revisión en progreso · Tiempo estimado: 24-48 horas</p>
            </div>
          </div>

          <div className="text-left space-y-4 mb-8">
            <h2 className="font-semibold text-lg mb-3">¿Qué estamos verificando?</h2>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="font-medium">Documentación</p>
                <p className="text-sm text-gray-600">
                  Estamos validando todos los documentos que subiste
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="font-medium">Email y Teléfono</p>
                <p className="text-sm text-gray-600">
                  Confirmando tus datos de contacto
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="font-medium">Información Legal</p>
                <p className="text-sm text-gray-600">
                  Verificando RUC y datos registrados con SENACSA
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Te notificaremos por email y SMS</strong> cuando tu cuenta sea aprobada.
              Mientras tanto, podés cerrar esta ventana.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full"
            >
              Cerrar Sesión
            </Button>
            <button
              onClick={() => openWhatsApp('595211234567')}
              className="w-full border border-gray-300 rounded-lg py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Consultar estado por WhatsApp
            </button>
            <p className="text-xs text-gray-500">
              ¿Tenés alguna duda? Contactanos a soporte@tropero.com.py
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
