import { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Camera, CheckCircle2, Upload, AlertTriangle, X } from 'lucide-react';

interface PhotoRequirement {
  type: string;
  label: string;
  icon: string;
  uploaded: boolean;
  file?: File;
  preview?: string;
}

interface ProofOfDeliveryUploadProps {
  tripId: string;
  destinationType: 'frigorifico' | 'estancia';
  onComplete: () => void;
  onCancel: () => void;
}

import { toast } from 'sonner';
export function ProofOfDeliveryUpload({ 
  tripId, 
  destinationType,
  onComplete,
  onCancel
}: ProofOfDeliveryUploadProps) {
  const initialRequirements: PhotoRequirement[] = destinationType === 'frigorifico' 
    ? [
        { type: 'bascula', label: 'Foto de la báscula', icon: '⚖️', uploaded: false },
        { type: 'nota', label: 'Nota firmada del frigorífico', icon: '📋', uploaded: false },
        { type: 'descarga', label: 'Animales descargando', icon: '🚛', uploaded: false }
      ]
    : [
        { type: 'descarga1', label: 'Foto de descarga 1', icon: '🚛', uploaded: false },
        { type: 'descarga2', label: 'Foto de descarga 2 (Opcional)', icon: '📸', uploaded: false },
        { type: 'descarga3', label: 'Foto de descarga 3 (Opcional)', icon: '📸', uploaded: false }
      ];

  const [requirements, setRequirements] = useState<PhotoRequirement[]>(initialRequirements);

  const requiredCount = destinationType === 'frigorifico' ? 3 : 1;
  const uploadedCount = requirements.filter(r => r.uploaded).length;
  const allComplete = destinationType === 'frigorifico' 
    ? uploadedCount === 3 
    : uploadedCount >= 1;

  const handlePhotoUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newRequirements = [...requirements];
      newRequirements[index] = {
        ...newRequirements[index],
        uploaded: true,
        file,
        preview: reader.result as string
      };
      setRequirements(newRequirements);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (index: number) => {
    const newRequirements = [...requirements];
    newRequirements[index] = {
      ...newRequirements[index],
      uploaded: false,
      file: undefined,
      preview: undefined
    };
    setRequirements(newRequirements);
  };

  const handleComplete = () => {
    if (allComplete) {
      toast.success('Prueba de entrega confirmada. El ganadero será notificado.');
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Camera className="w-8 h-8" style={{ color: '#1E5126' }} />
            <h1 className="text-xl font-bold">Prueba de Entrega</h1>
          </div>
          <p className="text-sm text-gray-600">
            Subí las fotos requeridas para confirmar la entrega
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8 space-y-6">
          
          {/* DESTINATION BADGE */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
            <span>Destino:</span>
            <span className="font-bold">
              {destinationType === 'frigorifico' ? '🏭 Frigorífico Concepción' : '🏡 Estancia El Carmen'}
            </span>
          </div>

          {/* PHOTO SECTIONS */}
          {requirements.map((req, index) => {
            const isOptional = req.label.includes('Opcional');
            
            return (
              <div 
                key={index} 
                className={`bg-white rounded-lg border-2 p-6 transition ${
                  req.uploaded ? 'border-green-700 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{req.icon}</span>
                    <div>
                      <Label className="text-base font-semibold">
                        {req.label}
                      </Label>
                      {!isOptional && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded font-semibold">
                          Requerido
                        </span>
                      )}
                      {isOptional && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-semibold">
                          Opcional
                        </span>
                      )}
                    </div>
                  </div>
                  {req.uploaded && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>

                {/* UPLOAD AREA OR PREVIEW */}
                {!req.uploaded ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-700 hover:bg-gray-50 transition">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Subir foto</span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG hasta 10MB</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(index, file);
                      }}
                    />
                  </label>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden border-2 border-green-600">
                      <img 
                        src={req.preview} 
                        alt={req.label} 
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-medium">Foto subida correctamente</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* WARNING (si incompleto) */}
          {!allComplete && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-700 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-yellow-900 mb-1">
                    Completá todos los requisitos para confirmar la entrega
                  </h3>
                  <p className="text-sm text-yellow-800">
                    {destinationType === 'frigorifico' 
                      ? 'Se requieren las 3 fotos para validar la entrega en el frigorífico.'
                      : 'Se requiere al menos 1 foto para validar la entrega.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS MESSAGE (si completo) */}
          {allComplete && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
              <div className="flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-700 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-green-900 mb-1">
                    ¡Todos los requisitos completados!
                  </h3>
                  <p className="text-sm text-green-800">
                    Podés confirmar la entrega. El ganadero será notificado y podrá revisar las fotos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* INFO BOX */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-semibold text-sm text-blue-900 mb-2">💡 Consejos:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>Asegurate que las fotos sean claras y legibles</li>
              <li>Incluí la mayor parte del contexto posible</li>
              {destinationType === 'frigorifico' && (
                <>
                  <li>La báscula debe mostrar claramente el peso</li>
                  <li>La nota debe estar firmada y legible</li>
                </>
              )}
            </ul>
          </div>

          {/* PROGRESS SUMMARY */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total de fotos subidas</div>
                <div className="text-2xl font-bold">{uploadedCount}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Requisitos cumplidos</div>
                <div className="text-2xl font-bold" style={{ color: allComplete ? '#1E5126' : '#6b7280' }}>
                  {uploadedCount} / {destinationType === 'frigorifico' ? '3' : '1+'}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${(uploadedCount / requiredCount) * 100}%`,
                    backgroundColor: allComplete ? '#1E5126' : '#f59e0b'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-white border-t border-gray-200 px-4 lg:px-6 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button 
            disabled={!allComplete}
            onClick={handleComplete}
            className="flex-1"
            style={{ backgroundColor: allComplete ? '#1E5126' : undefined }}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Confirmar Entrega
          </Button>
        </div>
      </div>
    </div>
  );
}
