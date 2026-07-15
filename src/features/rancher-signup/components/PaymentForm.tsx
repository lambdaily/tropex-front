import { AlertCircle, Building2, Wallet, Users, Smartphone } from 'lucide-react';
import { usePaymentForm } from '../hooks/usePaymentForm';
import type { PaymentFormProps, InstitutionType } from '../types/rancher-signup.types';
import type { FinancialInstitution } from '@/features/payments';
import { SignupHeader } from '@/app/components/tropero-v2/SignupHeader';

const INSTITUTION_TYPES: { value: Exclude<InstitutionType, null>; label: string; icon: typeof Building2 }[] = [
  { value: 'banco', label: 'Banco', icon: Building2 },
  { value: 'financiera', label: 'Financiera', icon: Wallet },
  { value: 'cooperativa', label: 'Cooperativa', icon: Users },
  { value: 'billetera', label: 'Billetera', icon: Smartphone },
];

export function PaymentForm({ onNext, onSkip, onBack, initialData, signupError }: PaymentFormProps) {
  const {
    formData,
    setFormData,
    selectedType,
    institutions,
    isLoadingInstitutions,
    isError,
    errors,
    isValid,
    handleBlur,
    hasError,
    markAllTouched,
    handleTypeSelect,
    getInstitutionLabel,
    documentTypes,
  } = usePaymentForm(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    markAllTouched();
    if (isValid) onNext(formData);
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-[#F6F1E8]">
      <SignupHeader onBack={onBack} onSkip={onSkip} />

      <main className="px-4 py-6 md:px-6 md:py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Método de pago</h1>
          <p className="text-gray-600 mb-6 md:mb-8">
            Selecciona dónde recibirás tus pagos por los servicios de flete
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
            <InstitutionTypeSelector
              selectedType={selectedType}
              onSelect={handleTypeSelect}
            />

            {selectedType && (
              <>
                <InstitutionSelect
                  label={getInstitutionLabel()}
                  value={formData.institution}
                  institutions={institutions}
                  isLoading={isLoadingInstitutions}
                  isError={isError}
                  hasError={hasError('institution')}
                  errorMessage={errors.institution}
                  onChange={(v) => handleFieldChange('institution', v)}
                  onBlur={() => handleBlur('institution')}
                />

                <TextField
                  label="Número de cuenta"
                  placeholder="123456789"
                  value={formData.accountNumber}
                  hasError={hasError('accountNumber')}
                  errorMessage={errors.accountNumber}
                  onChange={(v) => handleFieldChange('accountNumber', v)}
                  onBlur={() => handleBlur('accountNumber')}
                />

                <TextField
                  label="Nombre de titular"
                  placeholder="Juan González"
                  value={formData.accountHolderName}
                  hasError={hasError('accountHolderName')}
                  errorMessage={errors.accountHolderName}
                  onChange={(v) => handleFieldChange('accountHolderName', v)}
                  onBlur={() => handleBlur('accountHolderName')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <DocumentTypeSelect
                    value={formData.documentType}
                    documentTypes={documentTypes}
                    hasError={hasError('documentType')}
                    errorMessage={errors.documentType}
                    onChange={(v) => handleFieldChange('documentType', v)}
                    onBlur={() => handleBlur('documentType')}
                  />

                  <TextField
                    label="Número de documento"
                    placeholder="1234567"
                    value={formData.documentNumber}
                    hasError={hasError('documentNumber')}
                    errorMessage={errors.documentNumber}
                    onChange={(v) => handleFieldChange('documentNumber', v)}
                    onBlur={() => handleBlur('documentNumber')}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    💡 Esta información es necesaria para procesar tus pagos de manera segura. TROPEX remitirá los pagos del ganadero directamente a esta cuenta.
                  </p>
                </div>
              </>
            )}

            <FormActions
              isSubmitDisabled={!selectedType}
              onSkip={onSkip}
            />
          </form>
        </div>
      </main>
    </div>
  );
}

/* ─── Sub-components ─── */



function InstitutionTypeSelector({
  selectedType,
  onSelect,
}: {
  selectedType: InstitutionType;
  onSelect: (type: InstitutionType) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-black mb-3">
        Tipo de entidad <span className="text-red-500 ml-1">*</span>
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {INSTITUTION_TYPES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
              selectedType === value
                ? 'border-[#1E5126] bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Icon className={`w-8 h-8 mb-2 ${selectedType === value ? 'text-[#1E5126]' : 'text-gray-600'}`} />
            <span className={`text-sm font-medium ${selectedType === value ? 'text-[#1E5126]' : 'text-gray-700'}`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function InstitutionSelect({
  label,
  value,
  institutions,
  isLoading,
  isError,
  hasError,
  errorMessage,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  institutions: FinancialInstitution[];
  isLoading: boolean;
  isError: boolean;
  hasError: boolean;
  errorMessage?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  console.log('[InstitutionSelect] render', { institutions, isArray: Array.isArray(institutions), length: institutions?.length, isLoading, isError, hasError });
  return (
    <div>
      <label className="block text-sm font-medium text-black mb-2">
        {label} <span className="text-red-500 ml-1">*</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={isLoading}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126] disabled:bg-gray-50 disabled:cursor-not-allowed ${
          hasError ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">
          {isLoading
            ? 'Cargando instituciones...'
            : isError
              ? 'No se pudieron cargar las instituciones'
              : 'Seleccionar...'}
        </option>
        {institutions.map((inst) => (
          <option key={inst.id} value={inst.name}>
            {inst.name}
          </option>
        ))}
      </select>
      {isError && (
        <p className="text-xs text-amber-600 mt-1">
          No se pudieron cargar las instituciones. Escribí el nombre manualmente en la opción seleccionada.
        </p>
      )}
      {!isError && !isLoading && institutions.length === 0 && (
        <p className="text-xs text-gray-500 mt-1">No hay instituciones disponibles para este tipo.</p>
      )}
      {hasError && errorMessage && <p className="text-xs text-red-600 mt-1">{errorMessage}</p>}
    </div>
  );
}

function TextField({
  label,
  placeholder,
  value,
  hasError,
  errorMessage,
  onChange,
  onBlur,
}: {
  label: string;
  placeholder: string;
  value: string;
  hasError: boolean;
  errorMessage?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-black mb-2">
        {label} <span className="text-red-500 ml-1">*</span>
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126] ${
          hasError ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
      />
      {hasError && errorMessage && <p className="text-xs text-red-600 mt-1">{errorMessage}</p>}
    </div>
  );
}

function DocumentTypeSelect({
  value,
  documentTypes,
  hasError,
  errorMessage,
  onChange,
  onBlur,
}: {
  value: string;
  documentTypes: { label: string; value: string }[];
  hasError: boolean;
  errorMessage?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-black mb-2">
        Seleccione tipo de documento <span className="text-red-500 ml-1">*</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126] ${
          hasError ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">Seleccionar...</option>
        {documentTypes.map((docType) => (
          <option key={docType.value} value={docType.value}>
            {docType.label}
          </option>
        ))}
      </select>
      {hasError && errorMessage && <p className="text-xs text-red-600 mt-1">{errorMessage}</p>}
    </div>
  );
}

function FormActions({
  isSubmitDisabled,
  onSkip,
}: {
  isSubmitDisabled: boolean;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4">
      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="flex-1 px-8 py-4 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-[#1E5126]"
      >
        Finalizar registro
      </button>
      {/*<button
        type="button"
        onClick={onSkip}
        className="px-8 py-4 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
      >
        Omitir este paso
      </button>*/}
    </div>
  );
}
