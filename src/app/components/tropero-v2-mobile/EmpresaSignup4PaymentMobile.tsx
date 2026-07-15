import { useState } from 'react';
import { Beef, ChevronLeft, Building2, Wallet, Users, Smartphone } from 'lucide-react';

interface EmpresaSignup4MobileProps {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

type InstitutionType = 'banco' | 'financiera' | 'cooperativa' | 'billetera' | null;

const INSTITUTION_LISTS: Record<string, string[]> = {
  banco: ['Banco Atlas S.A.', 'Banco BASA S.A.', 'Banco Continental S.A.E.C.A.', 'Banco Familiar S.A.E.C.A.', 'Banco Itaú Paraguay S.A.', 'Banco Nacional de Fomento', 'Banco Regional S.A.E.C.A.', 'Sudameris Bank S.A.E.C.A.', 'Visión Banco S.A.E.C.A.', 'Ueno Bank S.A.'],
  financiera: ['Financiera FIC S.A.E.C.A.', 'Financiera Finexpar S.A.E.C.A.', 'Tu Financiera S.A.E.C.A.', 'Ueno Financiera S.A.E.C.A.'],
  cooperativa: ['Cooperativa Chortitzer Ltda', 'Cooperativa Loma Plata Ltda', 'Cooperativa Neuland Ltda', 'Cooperativa Coofy Ltda'],
  billetera: ['Tigo Money', 'Personal Pay', 'Wally', 'Dimo-Cabal', 'Tuparenda', 'Bancard S.A.'],
};

const documentTypes = ['Cedula de identidad paraguaya', 'RUC', 'Pasaporte', 'Registro de conducir'];

const TYPE_OPTIONS = [
  { id: 'banco' as const, icon: Building2, label: 'Banco' },
  { id: 'financiera' as const, icon: Wallet, label: 'Financiera' },
  { id: 'cooperativa' as const, icon: Users, label: 'Cooperativa' },
  { id: 'billetera' as const, icon: Smartphone, label: 'Billetera' },
];

export function EmpresaSignup4PaymentMobile({ onNext, onSkip, onBack }: EmpresaSignup4MobileProps) {
  const [selectedType, setSelectedType] = useState<InstitutionType>(null);
  const [formData, setFormData] = useState({ institution: '', accountNumber: '', accountHolderName: '', documentType: '', documentNumber: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
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
        <div className="flex gap-1">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: i <= 4 ? '#F58718' : 'rgba(255,255,255,0.25)' }} />
          ))}
        </div>
        <p className="text-white/60 text-xs mt-1">Paso 4 de 5 — Datos bancarios</p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">¿Cómo querés cobrar?</h1>
        <p className="text-gray-500 text-sm mb-7">Configurá tu cuenta para recibir pagos</p>

        <form id="emp4-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">Tipo de entidad *</p>
            <div className="grid grid-cols-2 gap-3">
              {TYPE_OPTIONS.map(({ id, icon: Icon, label }) => {
                const sel = selectedType === id;
                return (
                  <button key={id} type="button" onClick={() => { setSelectedType(id); setFormData({ ...formData, institution: '' }); }} className="flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all" style={{ borderColor: sel ? '#1E5126' : '#e5e7eb', backgroundColor: sel ? '#f0fdf4' : 'white' }}>
                    <Icon className="w-6 h-6 mb-2" style={{ color: sel ? '#1E5126' : '#6b7280' }} />
                    <span className="text-sm font-semibold" style={{ color: sel ? '#1E5126' : '#374151' }}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedType && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Entidad *</label>
                <select value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} required className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]">
                  <option value="">Seleccionar...</option>
                  {(INSTITUTION_LISTS[selectedType] || []).map((inst) => <option key={inst} value={inst}>{inst}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Número de cuenta *</label>
                <input type="text" value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} placeholder="123456789" required className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Nombre de titular *</label>
                <input type="text" value={formData.accountHolderName} onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })} placeholder="Nombre de la empresa" required className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Tipo de documento *</label>
                <select value={formData.documentType} onChange={(e) => setFormData({ ...formData, documentType: e.target.value })} required className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]">
                  <option value="">Seleccionar...</option>
                  {documentTypes.map((dt) => <option key={dt} value={dt}>{dt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Número de documento *</label>
                <input type="text" value={formData.documentNumber} onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })} placeholder="1234567" required className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]" />
              </div>
            </>
          )}
        </form>
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100 space-y-3">
        <button type="submit" form="emp4-form" disabled={!selectedType} className="w-full py-4 text-white font-bold text-base rounded-2xl disabled:opacity-40" style={{ backgroundColor: '#1E5126' }}>
          Continuar
        </button>
        <button onClick={onSkip} className="w-full py-3 text-sm font-medium text-gray-500 rounded-2xl border border-gray-200 bg-gray-50">
          Omitir este paso
        </button>
      </div>
    </div>
  );
}
