import { useState } from 'react';
import { Beef, ChevronLeft, Upload, FileText } from 'lucide-react';

interface RancherSignup3MobileProps {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

const documents = [
  { id: 'ruc', name: 'RUC o cédula tributaria' },
  { id: 'ranch', name: 'Identificación del establecimiento' },
  { id: 'other', name: 'Otros documentos' },
];

export function RancherSignup3DocumentsMobile({ onNext, onSkip, onBack }: RancherSignup3MobileProps) {
  const [uploaded, setUploaded] = useState<Record<string, string>>({});

  const handleUpload = (id: string) => {
    setUploaded({ ...uploaded, [id]: 'documento.pdf' });
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
          <div className="h-full rounded-full" style={{ backgroundColor: '#F58718', width: '100%' }} />
        </div>
        <p className="text-white/60 text-xs mt-1">Paso 3 de 3 — Documentos</p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Documentos</h1>
        <p className="text-gray-500 text-sm mb-7">Subí tus documentos ahora o completá este paso después</p>

        <div className="space-y-3 mb-6">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f3f4f6' }}>
                <FileText className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{doc.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{uploaded[doc.id] ?? 'PDF, JPG o PNG'}</p>
              </div>
              <button
                onClick={() => handleUpload(doc.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold flex-shrink-0"
                style={{ borderColor: '#1E5126', color: '#1E5126' }}
              >
                <Upload className="w-3.5 h-3.5" />
                {uploaded[doc.id] ? 'Cambiar' : 'Subir'}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm text-amber-800">
            <strong>Documentos opcionales</strong> — Podés subirlos más adelante desde tu panel de control.
          </p>
        </div>
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100 space-y-3">
        <button onClick={onNext} className="w-full py-4 text-white font-bold text-base rounded-2xl" style={{ backgroundColor: '#1E5126' }}>
          Continuar
        </button>
        <button onClick={onSkip} className="w-full py-3 text-sm font-medium text-gray-500 rounded-2xl border border-gray-200 bg-gray-50">
          Omitir este paso
        </button>
      </div>
    </div>
  );
}
