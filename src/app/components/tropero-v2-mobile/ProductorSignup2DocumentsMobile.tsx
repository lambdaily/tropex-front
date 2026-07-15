import { useState } from 'react';
import { Beef, ChevronLeft, Upload, FileText, X } from 'lucide-react';

interface ProductorSignup2MobileProps {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
  subTypeLabel?: string;
}

interface UploadedFile { name: string; size: number; }

const MAX_MB = 5;

export function ProductorSignup2DocumentsMobile({ onNext, onSkip, onBack, subTypeLabel = 'Productor' }: ProductorSignup2MobileProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selected = Array.from(e.target.files || []);
    const valid: UploadedFile[] = [];
    for (const f of selected) {
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(f.type)) { setError('Solo PDF, JPG o PNG.'); continue; }
      if (f.size > MAX_MB * 1024 * 1024) { setError(`"${f.name}" excede los ${MAX_MB}MB.`); continue; }
      valid.push({ name: f.name, size: f.size });
    }
    setFiles((prev) => [...prev, ...valid]);
    e.target.value = '';
  };

  const fmt = (b: number) => b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

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
          {[1,2,3].map((i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: i <= 2 ? '#F58718' : 'rgba(255,255,255,0.25)' }} />
          ))}
        </div>
        <p className="text-white/60 text-xs mt-1">Paso 2 de 3 — Documentos</p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Documentos del establecimiento</h1>
        <p className="text-gray-500 text-sm mb-7">Subí los documentos de tu establecimiento <strong>{subTypeLabel}</strong></p>

        <label htmlFor="doc-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer mb-4" style={{ borderColor: '#1E5126', backgroundColor: '#f0fdf4' }}>
          <Upload className="w-8 h-8 mb-2" style={{ color: '#1E5126' }} />
          <p className="text-sm font-semibold" style={{ color: '#1E5126' }}>Tocá para subir archivos</p>
          <p className="text-xs text-gray-400 mt-1">PDF, JPG o PNG — máx. {MAX_MB}MB</p>
          <input id="doc-upload" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
        </label>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        {files.length > 0 && (
          <div className="space-y-2 mb-6">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3">
                <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-400">{fmt(file.size)}</p>
                </div>
                <button onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100 space-y-3">
        <button onClick={onNext} className="w-full py-4 text-white font-bold text-base rounded-2xl" style={{ backgroundColor: '#1E5126' }}>
          {files.length > 0 ? `Continuar con ${files.length} documento${files.length !== 1 ? 's' : ''}` : 'Continuar sin documentos'}
        </button>
        <button onClick={onSkip} className="w-full py-3 text-sm font-medium text-gray-500 rounded-2xl border border-gray-200 bg-gray-50">
          Completar más tarde
        </button>
      </div>
    </div>
  );
}
