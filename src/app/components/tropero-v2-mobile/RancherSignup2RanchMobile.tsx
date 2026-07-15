import { useState } from 'react';
import { Beef, ChevronLeft, MapPin, Upload, FileText, X } from 'lucide-react';

import type { SignupData } from '../../types/signup';
interface RancherSignup2MobileProps {
  onNext: (data: Partial<SignupData>) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function RancherSignup2RanchMobile({ onNext, onSkip, onBack }: RancherSignup2MobileProps) {
  const [formData, setFormData] = useState({
    establishmentName: '',
    ruc: '',
    razonSocial: '',
    department: '',
    city: '',
    latitude: '',
    longitude: '',
    frequency: '',
  });
  const [accessMap, setAccessMap] = useState<File | null>(null);

  const handleMapClick = () => {
    setFormData({ ...formData, latitude: '-22.3510', longitude: '-60.0311', department: 'Boquerón', city: 'Filadelfia' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ ...formData, accessMap });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F6F1E8' }}>
      <header className="sticky top-0 z-10 px-4 pb-3 pt-3" style={{ backgroundColor: '#1E5126' }}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-1"><ChevronLeft className="w-6 h-6 text-white" /></button>
          <Beef className="w-5 h-5 text-white" />
          <span className="font-bold text-white text-lg">TROPEX</span>
          <button onClick={onSkip} className="ml-auto text-white/80 text-sm">Omitir</button>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ backgroundColor: '#F58718', width: '66%' }} />
        </div>
        <p className="text-white/60 text-xs mt-1">Paso 2 de 3 — Establecimiento</p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Localizar establecimiento</h1>
        <p className="text-gray-500 text-sm mb-7">Completá los datos de tu establecimiento SENACSA</p>

        <form id="rancher2-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Nombre del establecimiento</label>
            <input
              type="text"
              value={formData.establishmentName}
              onChange={(e) => setFormData({ ...formData, establishmentName: e.target.value })}
              placeholder="Ej: Campo Nuevo, Don Guy"
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">RUC *</label>
            <input
              type="text"
              value={formData.ruc}
              onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
              placeholder="80129693-5"
              required
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Razón Social *</label>
            <input
              type="text"
              value={formData.razonSocial}
              onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
              placeholder="Agropecuaria Huellas del Sur S.A."
              required
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
            />
          </div>

          {/* Map placeholder */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Ubicación</label>
            <div
              onClick={handleMapClick}
              className="w-full h-44 rounded-xl border-2 border-dashed flex items-center justify-center relative overflow-hidden cursor-pointer"
              style={{ backgroundColor: '#f0fdf4', borderColor: formData.latitude ? '#1E5126' : '#d1d5db' }}
            >
              {formData.latitude ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1E5126' }}>
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm text-gray-900">{formData.city}</p>
                    <p className="text-xs text-gray-500">{formData.department}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center px-4">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium text-gray-600">Tocá para ubicar tu establecimiento</p>
                  <p className="text-xs text-gray-400 mt-1">(Demo)</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Frecuencia de traslados</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
            >
              <option value="">Seleccionar...</option>
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
              <option value="trimestral">Trimestral</option>
              <option value="eventual">Eventual</option>
            </select>
          </div>

          {/* Map upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Mapa de acceso <span className="font-normal text-gray-400">(opcional)</span></label>
            {!accessMap ? (
              <label className="flex items-center gap-4 w-full border-2 border-dashed rounded-xl p-4 cursor-pointer" style={{ borderColor: '#d1d5db' }}>
                <Upload className="w-6 h-6 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Subir mapa de acceso</p>
                  <p className="text-xs text-gray-400">PNG, JPG o PDF (máx. 10MB)</p>
                </div>
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) setAccessMap(f); }} />
              </label>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <FileText className="w-6 h-6 text-green-600 flex-shrink-0" />
                <p className="flex-1 text-sm font-medium text-gray-900 truncate">{accessMap.name}</p>
                <button type="button" onClick={() => setAccessMap(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100 space-y-3">
        <button type="submit" form="rancher2-form" className="w-full py-4 text-white font-bold text-base rounded-2xl" style={{ backgroundColor: '#1E5126' }}>
          Continuar
        </button>
        <button onClick={onSkip} className="w-full py-3 text-sm font-medium text-gray-500 rounded-2xl border border-gray-200 bg-gray-50">
          Omitir este paso
        </button>
      </div>
    </div>
  );
}
