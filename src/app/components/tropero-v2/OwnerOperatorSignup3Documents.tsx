import { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {Upload, FileText, CreditCard, FileCheck} from 'lucide-react';
import { SignupHeader } from './SignupHeader';

interface OwnerOperatorSignup3DocumentsProps {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export function OwnerOperatorSignup3Documents({ onNext, onSkip, onBack }: OwnerOperatorSignup3DocumentsProps) {
  const [documents, setDocuments] = useState({
    driverLicense: null as File | null,
    senascaPermit: null as File | null,
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
          <div className="h-1.5 flex-1 bg-gray-200 rounded-full"></div>
          <div className="h-1.5 flex-1 bg-gray-200 rounded-full"></div>
        </div>
        <p className="text-sm text-gray-600">Paso 3 de 5</p>
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
            <h1 className="text-3xl font-bold mb-2">Documentos Necesarios</h1>
            <p className="text-gray-600">
              Subí tu licencia de conducir y permiso de transporte SENACSA. Podés completar esto más tarde si no los tenés a mano.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Driver License */}
            <div>
              <Label className="mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Licencia de Conducir
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="driverLicense"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('driverLicense', e.target.files?.[0] || null)}
                />
                <label htmlFor="driverLicense" className="cursor-pointer">
                  {documents.driverLicense ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <FileCheck className="w-5 h-5" />
                      <span className="text-sm">{documents.driverLicense.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Click para subir licencia</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG o PNG (máx. 5MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* SENACSA Permit */}
            <div>
              <Label className="mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Habilitación de transporte de la SENACSA
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="senascaPermit"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('senascaPermit', e.target.files?.[0] || null)}
                />
                <label htmlFor="senascaPermit" className="cursor-pointer">
                  {documents.senascaPermit ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <FileCheck className="w-5 h-5" />
                      <span className="text-sm">{documents.senascaPermit.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Click para subir permiso SENACSA</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG o PNG (máx. 5MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                📋 <strong>Nota:</strong> Estos documentos serán revisados por nuestro equipo. La aprobación puede tomar hasta 48 horas hábiles.
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
    </div>
  );
}