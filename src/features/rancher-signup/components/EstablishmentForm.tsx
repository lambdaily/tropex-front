import { useState } from 'react';
import { AlertCircle, Upload, FileText, X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { AutocompleteInput } from '@/app/components/ui/autocomplete-input';
import { LocationPicker } from './LocationPicker';
import { AccessMapUpload } from './AccessMapUpload';
import { useEstablishmentForm } from '../hooks/useEstablishmentForm';
import { authApi } from '@/features/auth/api/authApi';
import logoHorizontalBlanco from '@/assets/logo_horizontal_blanco.png';
import type { EstablishmentFormProps, EstablishmentFormErrors } from '../types/rancher-signup.types';

export function EstablishmentForm({ onNext, onBack, initialData, signupError }: EstablishmentFormProps) {
  const {
    formData,
    setFormData,
    establishmentOptions,
    isLoadingEstablishments,
    errors,
    isValid,
    handleBlur,
    showError,
    markAllTouched,
    handleEstablishmentSelect,
    handleAccessMapUpload,
    handleRemoveAccessMap,
  } = useEstablishmentForm(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    markAllTouched();
    if (isValid) onNext(formData);
  };

  return (
    <div className="min-h-screen bg-[#F6F1E8]">
      <FormHeader onBack={onBack} />

      <main className="px-4 py-6 md:px-6 md:py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">
            Localizar establecimiento
          </h1>
          <p className="text-gray-600 mb-6 md:mb-8">
            Busca tu establecimiento en la base de datos SENACSA y completa la información
          </p>

          {signupError && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm" role="alert">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-800">No pudimos crear tu cuenta</p>
                <p className="mt-0.5 whitespace-pre-line text-sm text-red-700">{signupError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <EstablishmentAutocomplete
              options={establishmentOptions}
              isLoading={isLoadingEstablishments}
              value={formData.establishmentName}
              onSelect={handleEstablishmentSelect}
            />

            <RucAndReasonFields
              ruc={formData.ruc}
              razonSocial={formData.razonSocial}
              onRucChange={(ruc) => setFormData({ ...formData, ruc })}
              onRazonSocialChange={(razonSocial) => setFormData({ ...formData, razonSocial })}
              onBlur={handleBlur}
              hasError={(field) => !!showError(field)}
              errors={errors}
            />

            <LocationPicker
              value={{
                latitude: formData.latitude,
                longitude: formData.longitude,
                department: formData.department,
                city: formData.city,
              }}
              onChange={(location) =>
                setFormData({
                  ...formData,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  department: location.department || '',
                  city: location.city || '',
                })
              }
            />
            {showError('location') && (
              <p className="text-xs text-red-600 mt-1">{errors.location}</p>
            )}

            <FrequencySelect
              value={formData.frequency}
              onChange={(frequency) => setFormData({ ...formData, frequency })}
            />


            <FormActions onBack={onBack} />
          </form>
        </div>
      </main>
    </div>
  );
}

/* ─── Sub-components ─── */

function FormHeader({ onBack }: { onBack: () => void }) {
  return (
    <>
      <header className="bg-[#1E5126] px-4 py-3 md:px-6 md:py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-white hover:text-gray-200 transition-colors">
              ← Volver
            </button>
            <div className="flex items-center gap-2">
              <img src={logoHorizontalBlanco} alt="TROPEX" className="h-12 w-auto" />
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 md:px-6 md:py-6 border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-900">Paso 2 de 3</span>
            <span className="text-sm text-gray-500">Localizar establecimiento</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="h-1.5 rounded-full bg-[#1E5126]" style={{ width: '66.66%' }} />
          </div>
        </div>
      </div>
    </>
  );
}

function EstablishmentAutocomplete({
  options,
  isLoading,
  value,
  onSelect,
}: {
  options: { code: string; name: string; display: string }[];
  isLoading: boolean;
  value: string;
  onSelect: (option: { code: string; name: string; display: string }) => void;
}) {
  return (
    <AutocompleteInput
      id="ranchEstablishment"
      label="Nombre del establecimiento (SENACSA)"
      placeholder={isLoading ? 'Cargando establecimientos...' : 'Buscar por nombre de establecimiento... Ej: Campo Nuevo, Don Guy, Arca de Noe'}
      options={options}
      value={value}
      onSelect={onSelect}
    />
  );
}

function RucAndReasonFields({
  ruc,
  razonSocial,
  onRucChange,
  onRazonSocialChange,
  onBlur,
  hasError,
  errors,
}: {
  ruc: string;
  razonSocial: string;
  onRucChange: (value: string) => void;
  onRazonSocialChange: (value: string) => void;
  onBlur: (field: string) => void;
  hasError: (field: string) => boolean;
  errors: EstablishmentFormErrors;
}) {
  const [rucValidation, setRucValidation] = useState<{
    isValid: boolean | null;
    isLoading: boolean;
    error: string | null;
  }>({
    isValid: null,
    isLoading: false,
    error: null,
  });

  const handleManualVerify = async () => {
    const rucToValidate = ruc.trim();
    
    if (!rucToValidate) {
      setRucValidation({ 
        isValid: false, 
        isLoading: false, 
        error: 'Ingresá un RUC primero'
      });
      return;
    }

    // Count only digits for minimum length check
    const digitCount = rucToValidate.replace(/\D/g, '').length;
    
    if (digitCount < 6) {
      setRucValidation({ 
        isValid: false, 
        isLoading: false, 
        error: 'RUC debe tener al menos 6 dígitos'
      });
      return;
    }

    setRucValidation({ 
      isValid: null, 
      isLoading: true, 
      error: null
    });

    try {
      // Send RUC exactly as user typed it (with hyphen)
      const result = await authApi.verifyRucReal(rucToValidate);
      
      if (result.valid && result.data) {
        setRucValidation({ 
          isValid: true, 
          isLoading: false, 
          error: null
        });
        // Auto-fill razón social with backend data
        if (result.data.razon_social) {
          onRazonSocialChange(result.data.razon_social);
        }
      } else {
        setRucValidation({ 
          isValid: false, 
          isLoading: false, 
          error: result.error || 'RUC no válido'
        });
      }
    } catch (error) {
      setRucValidation({ 
        isValid: false, 
        isLoading: false, 
        error: 'Error al validar RUC. Intentá de nuevo.'
      });
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126] ${
      hasError(field) ? 'border-red-500' : 
      field === 'ruc' && rucValidation.isValid === true ? 'border-green-500' :
      field === 'ruc' && rucValidation.isValid === false ? 'border-red-500' :
      'border-gray-300'
    }`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          RUC <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={ruc}
            onChange={(e) => onRucChange(e.target.value)}
            onBlur={() => onBlur('ruc')}
            className={inputClass('ruc')}
            placeholder="80129693-5"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rucValidation.isLoading ? (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            ) : rucValidation.isValid === true ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : rucValidation.isValid === false ? (
              <XCircle className="w-5 h-5 text-red-500" />
            ) : null}
          </div>
        </div>
        {rucValidation.error && (
          <p className="text-xs text-red-600 mt-1">{rucValidation.error}</p>
        )}
        {rucValidation.isValid === true && (
          <p className="text-xs text-green-600 mt-1">✓ RUC válido</p>
        )}
        {hasError('ruc') && !rucValidation.error && <p className="text-xs text-red-600 mt-1">{errors.ruc}</p>}
        
        {/* Manual verify button - prominent */}
        <button
          type="button"
          onClick={handleManualVerify}
          disabled={rucValidation.isLoading || !ruc.trim()}
          className="mt-3 w-full px-4 py-2.5 text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: rucValidation.isLoading ? '#9CA3AF' : '#1E5126',
            color: '#fff',
            border: 'none',
          }}
        >
          {rucValidation.isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verificando...
            </span>
          ) : rucValidation.isValid === true ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              RUC Verificado
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Verificar RUC
            </span>
          )}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Razón Social <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          value={razonSocial}
          onChange={(e) => onRazonSocialChange(e.target.value)}
          onBlur={() => onBlur('razonSocial')}
          className={inputClass('razonSocial')}
          placeholder="Se autocompleta al verificar el RUC"
        />
        {hasError('razonSocial') && (
          <p className="text-xs text-red-600 mt-1">{errors.razonSocial}</p>
        )}
      </div>
    </div>
  );
}

function FrequencySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-black mb-2">
        Frecuencia aproximada de traslados
        <span className="text-gray-500 font-normal ml-2">Opcional</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  );
}


function FormActions({
  onBack,
}: {
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 pt-4">
      <button
        type="submit"
        className="w-full px-8 py-4 text-white font-semibold rounded-lg transition-colors bg-[#1E5126]"
      >
        Continuar
      </button>
      <button
        type="button"
        onClick={onBack}
        className="w-full px-8 py-4 text-[#1E5126] font-semibold rounded-lg border border-[#1E5126] bg-white hover:bg-[#EAF3EC] transition-colors"
      >
        Volver
      </button>
    </div>
  );
}
