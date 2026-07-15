import { Button } from '../ui/button';
import {XCircle, Mail, Phone} from 'lucide-react';
import { SignupHeader } from './SignupHeader';

interface AccountRejectedProps {
  userName?: string;
  userRole?: string;
  rejectionReason?: string;
  onResubmit: () => void;
  onLogout: () => void;
}

export function AccountRejected({ 
  userName = 'Usuario', 
  userRole = 'ganadero', 
  rejectionReason = 'Los documentos proporcionados no cumplen con los requisitos necesarios.', 
  onResubmit, 
  onLogout 
}: AccountRejectedProps) {
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
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-3xl font-bold mb-3">Verificación No Completada</h1>
          <p className="text-lg text-gray-600 mb-6">
            {userName}, necesitamos que revises tu solicitud
          </p>

          <div className="border-l-4 border-red-400 bg-red-50 rounded-lg p-5 mb-8">
            <p className="text-red-800 font-medium mb-2">
              Motivo del rechazo:
            </p>
            <p className="text-red-700">
              {rejectionReason}
            </p>
          </div>

          <div className="text-left space-y-4 mb-8">
            <h2 className="font-semibold text-lg mb-3">¿Qué podés hacer?</h2>
            
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#1E5126' }}>
                1
              </div>
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  Revisá los documentos que subiste y asegurate de que:
                </p>
                <ul className="text-sm text-gray-600 ml-2 list-disc space-y-1">
                  <li>Las imágenes sean claras y legibles</li>
                  <li>Los documentos estén vigentes</li>
                  <li>La información coincida con tus datos de registro</li>
                  <li>Todos los campos requeridos estén completos</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#1E5126' }}>
                2
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  Corregí la información necesaria y volvé a enviar tu solicitud
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-800">
              <strong>¿Necesitás ayuda?</strong> Nuestro equipo está disponible para asistirte
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-3 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4" />
                <span>soporte@tropero.com.py</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4" />
                <span>+595 21 123 4567</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onResubmit}
              className="flex-1 text-white hover:opacity-90"
              style={{ backgroundColor: '#F58718' }}
            >
              Corregir y Reenviar
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="flex-1"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
