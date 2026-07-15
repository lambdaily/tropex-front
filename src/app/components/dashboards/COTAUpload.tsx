import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertTriangle, FileText, Camera, CheckCircle2, Upload } from 'lucide-react';

interface COTAUploadProps {
  onComplete: () => void;
  onCancel: () => void;
}

import { toast } from 'sonner';
export function COTAUpload({ onComplete, onCancel }: COTAUploadProps) {
  const [selectedMethod, setSelectedMethod] = useState<'number' | 'photo'>('number');
  const [cotaNumber, setCotaNumber] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const isValid = selectedMethod === 'number' ? cotaNumber.length > 0 : photoFile !== null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = () => {
    if (isValid) {
      toast.success(`COTA confirmado: ${selectedMethod === 'number' ? cotaNumber : 'Foto subida'}`);
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <h1 className="text-xl font-bold">COTA Requerido</h1>
              <p className="text-sm text-gray-600">
                Certificado obligatorio para iniciar viaje
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 lg:px-6 py-8 space-y-6">
          
          {/* DESCRIPCIÓN */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-700">
              El Certificado Oficial de Tránsito de Animales (COTA) es obligatorio 
              para iniciar el viaje según normativa SENACSA.
            </p>
          </div>

          {/* SELECTOR DE MÉTODO */}
          <div className="grid md:grid-cols-2 gap-4">
            <button 
              onClick={() => setSelectedMethod('number')}
              className={`p-6 bg-white rounded-lg border-2 transition text-left ${
                selectedMethod === 'number' 
                  ? 'border-green-700 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <FileText 
                  className="w-6 h-6" 
                  style={{ color: selectedMethod === 'number' ? '#1E5126' : '#6b7280' }} 
                />
                <h3 className="font-bold">Opción 1: Número de COTA</h3>
              </div>
              <p className="text-sm text-gray-600">
                Ingresá el número emitido por SENACSA
              </p>
            </button>

            <button 
              onClick={() => setSelectedMethod('photo')}
              className={`p-6 bg-white rounded-lg border-2 transition text-left ${
                selectedMethod === 'photo' 
                  ? 'border-green-700 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Camera 
                  className="w-6 h-6" 
                  style={{ color: selectedMethod === 'photo' ? '#1E5126' : '#6b7280' }} 
                />
                <h3 className="font-bold">Opción 2: Foto de COTA</h3>
              </div>
              <p className="text-sm text-gray-600">
                Subí una foto del documento
              </p>
            </button>
          </div>

          {/* INPUT ÁREA - OPCIÓN 1: NÚMERO */}
          {selectedMethod === 'number' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <Label className="mb-2">Número de COTA *</Label>
              <Input 
                type="text" 
                value={cotaNumber}
                onChange={(e) => setCotaNumber(e.target.value)}
                placeholder="Ej: COTA-2026-001234"
                className="text-lg mb-2"
              />
              <p className="text-xs text-gray-500">
                El número aparece en el documento emitido por SENACSA
              </p>
            </div>
          )}

          {/* INPUT ÁREA - OPCIÓN 2: FOTO */}
          {selectedMethod === 'photo' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <Label className="mb-3 block">Foto del COTA *</Label>
              
              {!photoPreview ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-700 hover:bg-gray-50 transition">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <span className="text-sm font-medium text-gray-700 mb-1">Subir foto del COTA</span>
                  <span className="text-xs text-gray-500">PNG, JPG hasta 10MB</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handlePhotoChange}
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-lg overflow-hidden border-2 border-green-600">
                    <img 
                      src={photoPreview} 
                      alt="COTA preview" 
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Subido
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview('');
                    }}
                  >
                    Cambiar foto
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* WARNING BOX */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-700 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-1">
                  No podrás iniciar el viaje sin COTA verificado
                </h3>
                <p className="text-sm text-yellow-800">
                  El sistema validará este documento antes de permitir 
                  que el transportista inicie el viaje.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BUTTONS */}
      <div className="bg-white border-t border-gray-200 px-4 lg:px-6 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button 
            disabled={!isValid}
            onClick={handleComplete} 
            className="flex-1"
            style={{ backgroundColor: isValid ? '#1E5126' : undefined }}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Confirmar COTA
          </Button>
        </div>
      </div>
    </div>
  );
}
