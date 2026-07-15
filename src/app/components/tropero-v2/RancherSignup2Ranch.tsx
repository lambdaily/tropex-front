import { useState, useEffect, useMemo } from 'react';
import {MapPin, Upload, FileText, X} from 'lucide-react';
import { AutocompleteInput, AutocompleteOption } from '../ui/autocomplete-input';
import { establishmentsData } from '../../data/establishments-data';

import type { SignupData } from '../../types/signup';
import { SignupHeader } from './SignupHeader';
interface RancherSignup2Props {
  onNext: (data: Partial<SignupData>) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function RancherSignup2Ranch({ onNext, onSkip, onBack }: RancherSignup2Props) {
  const [formData, setFormData] = useState({
    establishmentName: '',
    ruc: '',
    razonSocial: '',
    latitude: '',
    longitude: '',
    department: '',
    city: '',
    frequency: '',
  });

  const [accessMap, setAccessMap] = useState<File | null>(null);

  // Memoize autocomplete options to prevent re-creating on every render
  const establishmentOptions: AutocompleteOption[] = useMemo(
    () =>
      establishmentsData.map((est) => ({
        code: est.establishmentName,
        name: est.establishmentName,
        display: est.establishmentName,
      })),
    []
  );

  const handleEstablishmentSelect = (option: AutocompleteOption) => {
    // Only autocomplete the establishment name
    setFormData({
      ...formData,
      establishmentName: option.name,
    });
  };

  // Auto-fill razón social when specific RUC is entered
  useEffect(() => {
    if (formData.ruc === '80069100-8' || formData.ruc === '800691008') {
      setFormData((prev) => ({
        ...prev,
        razonSocial: 'GANADERA LA JOYA SOCIEDAD ANONIMA',
      }));
    }
  }, [formData.ruc]);

  const handleAccessMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAccessMap(file);
    }
  };

  const handleRemoveAccessMap = () => {
    setAccessMap(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ ...formData, accessMap });
  };

  // Simulate map pin placement
  const handleMapClick = () => {
    // Demo: simulate pin placement and auto-fill location
    setFormData({
      ...formData,
      latitude: '-22.3510',
      longitude: '-60.0311',
      department: 'Boquerón',
      city: 'Filadelfia',
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1E8' }}>
            {/* Header */}
      <SignupHeader onBack={onBack} onSkip={onSkip} />

      {/* Progress */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-900">Paso 2 de 3</span>
            <span className="text-sm text-gray-500">Localizar establecimiento</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="h-1.5 rounded-full" style={{ backgroundColor: '#1E5126', width: '66.66%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-2">Localizar establecimiento</h1>
          <p className="text-gray-600 mb-8">
            Busca tu establecimiento en la base de datos SENACSA y completa la información
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Establecimiento Autocomplete - Only name */}
            <AutocompleteInput
              id="ranchEstablishment"
              label="Nombre del establecimiento (SENACSA)"
              placeholder="Buscar por nombre de establecimiento... Ej: Campo Nuevo, Don Guy, Arca de Noe"
              options={establishmentOptions}
              value={formData.establishmentName}
              onSelect={handleEstablishmentSelect}
            />

            {/* RUC and Razón Social */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  RUC
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ruc}
                  onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126]"
                  placeholder="80129693-5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Razón Social
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126]"
                  placeholder="Agropecuaria Huellas del Sur S.A."
                  required
                />
              </div>
            </div>

            {/* Map Section */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Ubicación del establecimiento
              </label>
              <div
                onClick={handleMapClick}
                className="w-full h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-gray-300 flex items-center justify-center relative overflow-hidden cursor-pointer hover:border-[#1E5126] transition-colors"
              >
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, #666 0px, #666 1px, transparent 1px, transparent 30px), repeating-linear-gradient(90deg, #666 0px, #666 1px, transparent 1px, transparent 30px)'
                }} />

                {formData.latitude && formData.longitude ? (
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-red-400 rounded-full opacity-30 animate-ping"></div>
                      <div className="relative bg-red-600 rounded-full p-3 shadow-lg">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-3 bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-red-600">
                      <div className="text-sm font-bold text-gray-900">{formData.city}</div>
                      <div className="text-xs text-gray-600">{formData.department}</div>
                    </div>
                  </div>
                ) : (
                  <div className="relative text-center z-10 bg-white bg-opacity-90 p-6 rounded-lg">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm font-medium text-gray-700">Mapa de Paraguay</p>
                    <p className="text-xs text-gray-500 mt-1">Haz click para ubicar tu establecimiento (Demo)</p>
                  </div>
                )}
              </div>
              {formData.latitude && formData.longitude && (
                <div className="mt-2 text-sm text-gray-600">
                  📍 Ubicación: {formData.city}, {formData.department} ({formData.latitude}, {formData.longitude})
                </div>
              )}
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Frecuencia aproximada de traslados
                <span className="text-gray-500 font-normal ml-2">Opcional</span>
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126]"
              >
                <option value="">Seleccionar...</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
                <option value="trimestral">Trimestral</option>
                <option value="eventual">Eventual</option>
              </select>
            </div>

            {/* Access Map Upload */}
            {/*<div>
              <label className="block text-sm font-medium text-black mb-2">
                Mapa de acceso al establecimiento
                <span className="text-gray-500 font-normal ml-2">Opcional</span>
              </label>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Si tenés un plano o indicaciones de cómo llegar a tu establecimiento, podés subirlo aquí. Será útil para los transportistas.
                </p>

                {!accessMap ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-[#1E5126] hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-1 text-sm text-gray-700 font-medium">
                        Haz clic para subir el mapa de acceso
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF (máx. 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={handleAccessMapUpload}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{accessMap.name}</p>
                        <p className="text-xs text-gray-600">
                          {(accessMap.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAccessMap}
                      className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </div>*/}

            {/* Info Banner */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                💡 El autocomplete solo completa el nombre del establecimiento. Los demás campos deben ser completados manualmente.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-8 py-4 text-white font-semibold rounded-lg transition-colors"
                style={{ backgroundColor: '#1E5126' }}
              >
                Continuar
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="px-8 py-4 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Omitir este paso
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
