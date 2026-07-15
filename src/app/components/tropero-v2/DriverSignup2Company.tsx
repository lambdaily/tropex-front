import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {Building2, Key, Info, X} from 'lucide-react';

import type { SignupData } from '../../types/signup';
import { SignupHeader } from './SignupHeader';
interface DriverSignup2CompanyProps {
  onNext: (data: Partial<SignupData>) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function DriverSignup2Company({ onNext, onSkip, onBack }: DriverSignup2CompanyProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    invitationCode: '',
  });
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
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
          <div className="h-1.5 flex-1 bg-gray-200 rounded-full"></div>
        </div>
        <p className="text-sm text-gray-600">Paso 2 de 3</p>
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
            <h1 className="text-3xl font-bold mb-2">Empresa Asignada</h1>
            <p className="text-gray-600">
              Información de la empresa para la que trabajás
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                💡 <strong>¿Tenés un código de invitación?</strong> Tu empleador debería haberte dado un código para vincular tu cuenta.
              </p>
            </div>

            <div>
              <Label htmlFor="invitationCode" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Código de Invitación (Opcional)
              </Label>
              <Input
                id="invitationCode"
                type="text"
                value={formData.invitationCode}
                onChange={(e) => {
                  const newCode = e.target.value;
                  // If invitation code is entered, clear company name as code will override it
                  setFormData({
                    ...formData,
                    invitationCode: newCode,
                    companyName: newCode ? '' : formData.companyName
                  });
                }}
                placeholder="Ej: TROPE-2024-ABC123"
                className="mt-1.5"
                disabled={!!formData.companyName}
              />
              <p className="text-xs text-gray-500 mt-1">Si no tenés un código, podés ingresar el nombre de la empresa manualmente</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#F6F1E8] px-2 text-gray-500">o ingresá manualmente</span>
              </div>
            </div>

            <div>
              <Label htmlFor="companyName" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Nombre de la Empresa
                {!formData.invitationCode && <span className="text-red-500">*</span>}
                <button
                  type="button"
                  onClick={() => setShowInfoModal(true)}
                  className="ml-auto"
                >
                  <Info className="w-4 h-4 text-gray-500 hover:text-gray-700 transition-colors" />
                </button>
              </Label>
              <Input
                id="companyName"
                type="text"
                value={formData.companyName}
                onChange={(e) => {
                  const newName = e.target.value;
                  // If company name is entered, clear invitation code as name will override it
                  setFormData({
                    ...formData,
                    companyName: newName,
                    invitationCode: newName ? '' : formData.invitationCode
                  });
                }}
                placeholder="Ej: Transportes Ganaderos del Chaco S.A."
                required={!formData.invitationCode}
                disabled={!!formData.invitationCode}
                className="mt-1.5"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Importante:</strong> Verificaremos que la empresa esté registrada antes de aprobar tu cuenta.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              style={{ backgroundColor: '#1E5126' }}
            >
              Continuar
            </Button>
          </form>
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md md:max-w-lg w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-black">Sobre el nombre de la empresa</h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                Por ahora, podés ingresar el nombre de tu empresa manualmente. Asegurate de escribirlo correctamente para que podamos verificar que esté registrada en TROPEX.
              </p>
              <p>
                <strong>En el futuro:</strong> Esta base de nombres de empresas se irá actualizando automáticamente a medida que más empresas se sumen a la plataforma. Eventualmente se convertirá en un menú desplegable con opciones existentes para evitar errores ortográficos.
              </p>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full mt-6 px-4 py-3 text-white font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: '#1E5126' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
