import { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {Upload, CreditCard, FileText, FileCheck} from 'lucide-react';
import { SignupHeader } from './SignupHeader';

interface DriverSignup3DocumentsProps {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export function DriverSignup3Documents({ onNext, onSkip, onBack }: DriverSignup3DocumentsProps) {
  const [documents, setDocuments] = useState({
    idDocument: null as File | null,
  });

  const handleFileChange = (field: keyof typeof documents, file: File | null) => {
    setDocuments({ ...documents, [field]: file });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
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
          <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: '#1E5126' }}></div>
        </div>
        <p className="text-sm text-gray-600">Paso 3 de 3</p>
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
            <h1 className="text-3xl font-bold mb-2">Tu Documento de Identidad</h1>
            <p className="text-gray-600">
              Subí tu cédula de identidad. Podés completar esto más tarde si no la tenés a mano.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ID Document */}
            <div>
              <Label className="mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Cédula de Identidad (Opcional)
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="idDocument"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('idDocument', e.target.files?.[0] || null)}
                />
                <label htmlFor="idDocument" className="cursor-pointer">
                  {documents.idDocument ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <FileCheck className="w-5 h-5" />
                      <span className="text-sm">{documents.idDocument.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Click para subir cédula</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG o PNG (máx. 5MB)</p>
                    </>
                  )}
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">Frente y dorso en un solo archivo o imagen clara. Podés subirla ahora o más tarde desde tu panel.</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⏳ <strong>Pendiente de aprobación:</strong> Una vez que completes el registro, el administrador de tu empresa deberá aprobar tu solicitud antes de que puedas empezar a operar.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              style={{ backgroundColor: '#1E5126' }}
            >
              Finalizar Registro
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}