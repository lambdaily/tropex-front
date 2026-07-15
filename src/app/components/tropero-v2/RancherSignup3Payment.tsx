import { useState } from 'react';
import { Beef, Building2, Wallet, Users, Smartphone } from 'lucide-react';

import type { SignupData } from '../../types/signup';
interface RancherSignup3Props {
  onNext: (data: Partial<SignupData>) => void;
  onSkip: () => void;
  onBack: () => void;
}

type InstitutionType = 'banco' | 'financiera' | 'cooperativa' | 'billetera' | null;

const bancos = [
  'Banco Atlas S.A.',
  'Banco BASA S.A.',
  'Banco Continental S.A.E.C.A.',
  'Banco de la Nación Argentina',
  'Banco do Brasil S.A.',
  'Banco Familiar S.A.E.C.A.',
  'Banco GNB Paraguay S.A.E.C.A.',
  'Banco Itaú Paraguay S.A.',
  'Banco Nacional de Fomento',
  'Banco Regional S.A.E.C.A.',
  'Banco Río S.A.E.C.A.',
  'Bancop S.A.',
  'Citibank N.A.',
  'Interfisa Banco S.A.E.C.A.',
  'Sudameris Bank S.A.E.C.A.',
  'Visión Banco S.A.E.C.A.',
  'Ueno Bank S.A.',
  'Zeta Banco S.A.E.C.A.',
  'Solar Banco S.A.E.',
  'Banco Central del Paraguay',
];

const financieras = [
  'Financiera FIC S.A.E.C.A.',
  'Financiera Paraguayo Japonesa S.A.E.C.A.',
  'Financiera Finexpar S.A.E.C.A.',
  'Finlatina S.A. de Finanzas',
  'Solar Ahorro y Finanzas S.A.E.C.A.',
  'Tu Financiera S.A.E.C.A.',
  'Cefisa S.A.E.C.A.',
  'Ueno Financiera S.A.E.C.A.',
];

const cooperativas = [
  'Cooperativa Coofy Ltda',
  'Cooperativa Loma Plata Ltda',
  'Cooperativa Neuland Ltda',
  'Cooperativa Coopexsanjo Ltda',
  'Cooperativa Multiactiva de Ahorro y Credito',
  'Cooperativa del Sur de Ahorro y Credito',
  'Cooperativa Mcal Francisco Solano Lopez Ltda',
  'Cooperativa Sagrados Corazones Ltda',
  'Cooperativa Ayacape Ltda',
  'Cooperativa Aleman Concordia Ltda',
  'Cooperativa Aviadores del Chaco Ltda',
  'Cooperativa Barrereña Ltda',
  'Cooperativa Cumbre de la Cordillera Ltda',
  'Cooperativa Coomecipar Ltda',
  'Cooperativa 21 de Setiembre Ltda',
  'Cooperativa Credivill Ltda',
  'Cooperativa Luque Ltda',
  'Cooperativa Chortitzer Ltda',
  'Cooperativa Coopeduc Ltda',
  'Cooperativa Capiata Ltda',
  'Cooperativa Barriojarense Ltda',
  'Cooperativa Colonizadora Multiactiva Ltda',
  'Cooperativa Credit Union Ltda',
  'Cooperativa Tobati Ltda',
  'Cooperativa 8 de Marzo Ltda',
  'Cooperande',
  'Coopdene',
  'Cooperativa Medalla Milagrosa Ltda',
  'Cooperativa Friesland Ltda',
  'Cooperativa Nuestra Señora del Perpetuo Socorro Ltda',
  'Cooperativa J Augusto Saldívar Ltda',
  'Cooperativa Coopavra Ltda',
  'Cooperativa Pinoza Ltda',
  'Cooperativa 26 de Abril Ltda',
  'Cooperativa San Pedro Ltda',
  'Cooperativa Nazareth Ltda',
  'Cooperativa Serrana Ltda',
  'Cooperativa Universitaria Ltda',
  'Coopensa',
  'Cooperativa San Florian Ltda',
  'Cooperativa de Graduados en Ciencias Economicas Ltda',
  'Cooperativa San Cristobal Ltda',
  'Cooperativa Ka\'aru Pora Ltda',
  'Cooperativa Mburicao Ltda',
  'Cooperativa Ypacarai Ltda',
  'Cooperativa La Norteña Ycuamandyyu Ltda',
  'Cooperativa de Trabajadores Ltda',
  'Cooperativa Reducto Ltda',
  'Cooperativa Regional Sud Ltda',
  'Cooperativa Mercado 4 Ltda',
  'Cooperativa Paraguaya de la Construccion Ltda',
  'Copavic',
  'Cooperativa Lambare Ltda',
  'Cooperativa Judicial Ltda',
  'Cooperativa Coopdiez Ltda',
  'Cooperativa Yoayu Ltda',
  'Cooperativa Aregua Ltda',
  'Cooperativa Ñemby Ltda',
  'Coopersam Ltda',
  'Agencia Financiera de Desarrollo',
  'Ministerio de Hacienda',
  'Bolsa de Valores y Productos de Asunción',
];

const billeteras = [
  'Tigo Money',
  'Personal Pay',
  'Wally',
  'Dimo-Cabal',
  'Tuparenda',
  'Bancard S.A.',
];

const documentTypes = [
  'Cedula de identidad paraguaya',
  'RUC',
  'Certificado de antecedentes',
  'Libreta de baja',
  'Libreta civica',
  'CRC - Documento extranjero',
  'CRP',
  'Nro asegurado IPS',
  'Padron caja jublicaciones',
  'Pasaporte',
  'Registro de conducir',
];

export function RancherSignup3Payment({ onNext, onSkip, onBack }: RancherSignup3Props) {
  const [selectedType, setSelectedType] = useState<InstitutionType>(null);
  const [formData, setFormData] = useState({
    institutionType: '',
    institution: '',
    accountNumber: '',
    accountHolderName: '',
    documentType: '',
    documentNumber: '',
  });

  const handleTypeSelect = (type: InstitutionType) => {
    setSelectedType(type);
    setFormData({
      ...formData,
      institutionType: type || '',
      institution: '',
    });
  };

  const getInstitutionList = () => {
    switch (selectedType) {
      case 'banco':
        return bancos;
      case 'financiera':
        return financieras;
      case 'cooperativa':
        return cooperativas;
      case 'billetera':
        return billeteras;
      default:
        return [];
    }
  };

  const getInstitutionLabel = () => {
    switch (selectedType) {
      case 'banco':
        return 'Seleccione un banco';
      case 'financiera':
        return 'Seleccione una financiera';
      case 'cooperativa':
        return 'Seleccione una cooperativa';
      case 'billetera':
        return 'Seleccione una billetera';
      default:
        return 'Seleccione una entidad';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1E8' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#1E5126' }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-white hover:text-gray-200 transition-colors mr-3"
            >
              ← Volver
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <Beef className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TROPEX</span>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="px-3 py-1.5 text-sm font-medium rounded-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
          >
            Omitir este paso
          </button>
        </div>
      </header>

      {/* Progress */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-900">Paso 3 de 3</span>
            <span className="text-sm text-gray-500">Método de pago</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="h-1.5 rounded-full" style={{ backgroundColor: '#1E5126', width: '100%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-2">Método de pago</h1>
          <p className="text-gray-600 mb-8">
            Selecciona dónde recibirás tus pagos por los servicios de flete
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection Icons */}
            <div>
              <label className="block text-sm font-medium text-black mb-3">
                Tipo de entidad
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => handleTypeSelect('banco')}
                  className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                    selectedType === 'banco'
                      ? 'border-[#1E5126] bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Building2
                    className={`w-8 h-8 mb-2 ${
                      selectedType === 'banco' ? 'text-[#1E5126]' : 'text-gray-600'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      selectedType === 'banco' ? 'text-[#1E5126]' : 'text-gray-700'
                    }`}
                  >
                    Banco
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeSelect('financiera')}
                  className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                    selectedType === 'financiera'
                      ? 'border-[#1E5126] bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Wallet
                    className={`w-8 h-8 mb-2 ${
                      selectedType === 'financiera' ? 'text-[#1E5126]' : 'text-gray-600'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      selectedType === 'financiera' ? 'text-[#1E5126]' : 'text-gray-700'
                    }`}
                  >
                    Financiera
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeSelect('cooperativa')}
                  className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                    selectedType === 'cooperativa'
                      ? 'border-[#1E5126] bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Users
                    className={`w-8 h-8 mb-2 ${
                      selectedType === 'cooperativa' ? 'text-[#1E5126]' : 'text-gray-600'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      selectedType === 'cooperativa' ? 'text-[#1E5126]' : 'text-gray-700'
                    }`}
                  >
                    Cooperativa
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeSelect('billetera')}
                  className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                    selectedType === 'billetera'
                      ? 'border-[#1E5126] bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Smartphone
                    className={`w-8 h-8 mb-2 ${
                      selectedType === 'billetera' ? 'text-[#1E5126]' : 'text-gray-600'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      selectedType === 'billetera' ? 'text-[#1E5126]' : 'text-gray-700'
                    }`}
                  >
                    Billetera
                  </span>
                </button>
              </div>
            </div>

            {/* Institution Dropdown - Only show when type is selected */}
            {selectedType && (
              <>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {getInstitutionLabel()}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126]"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {getInstitutionList().map((inst) => (
                      <option key={inst} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Número de cuenta
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126]"
                    placeholder="123456789"
                    required
                  />
                </div>

                {/* Account Holder Name */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Nombre de titular
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126]"
                    placeholder="Juan González"
                    required
                  />
                </div>

                {/* Document Type and Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Seleccione tipo de documento
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={formData.documentType}
                      onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126]"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {documentTypes.map((docType) => (
                        <option key={docType} value={docType}>
                          {docType}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Número de documento
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.documentNumber}
                      onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126]"
                      placeholder="1234567"
                      required
                    />
                  </div>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    💡 Esta información es necesaria para procesar tus pagos de manera segura. TROPEX remitirá los pagos del ganadero directamente a esta cuenta.
                  </p>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={!selectedType}
                className="flex-1 px-8 py-4 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#1E5126' }}
              >
                Finalizar registro
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
