import { useState } from 'react';
import { Button } from '../ui/button';
import {Upload, X, FileText} from 'lucide-react';
import { SignupHeader } from './SignupHeader';

interface ProductorSignup2DocumentsProps {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
  subTypeLabel?: string;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export function ProductorSignup2Documents({ onNext, onSkip, onBack, subTypeLabel = 'Productor' }: ProductorSignup2DocumentsProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = Array.from(e.target.files || []);
    const valid: UploadedFile[] = [];

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Solo se aceptan archivos PDF, JPG o PNG.');
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`El archivo "${file.name}" excede el límite de ${MAX_SIZE_MB}MB.`);
        continue;
      }
      valid.push({ name: file.name, size: file.size, type: file.type });
    }

    setUploadedFiles(prev => [...prev, ...valid]);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', backgroundColor: '#F6F1E8' }}>
            {/* Header */}
      <SignupHeader onBack={onBack} onSkip={onSkip} />

      {/* Progress */}
      <div className="max-w-2xl mx-auto w-full px-6 py-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: '#1E5126' }}></div>
          <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: '#1E5126' }}></div>
          <div className="h-1.5 flex-1 bg-gray-200 rounded-full"></div>
        </div>
        <p className="text-sm text-gray-600">Paso 2 de 3 — Documentos</p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <button onClick={onBack} className="text-sm mb-6 hover:text-gray-600" style={{ color: '#1E5126' }}>
            ← Volver
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Documentos del establecimiento</h1>
            <p className="text-gray-600">
              Subí los documentos de tu establecimiento <strong>{subTypeLabel}</strong>. Este paso es opcional y podés completarlo después.
            </p>
          </div>

          {/* Upload area */}
          <label
            htmlFor="doc-upload"
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors mb-4"
            style={{ borderColor: '#1E5126', backgroundColor: '#f0fdf4' }}
          >
            <Upload className="w-8 h-8 mb-2" style={{ color: '#1E5126' }} />
            <p className="text-sm font-medium" style={{ color: '#1E5126' }}>Hacé click para subir archivos</p>
            <p className="text-xs text-gray-500 mt-1">PDF, JPG o PNG — máx. {MAX_SIZE_MB}MB por archivo</p>
            <input
              id="doc-upload"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {error && (
            <p className="text-sm text-red-600 mb-3">{error}</p>
          )}

          {/* Uploaded files list */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2 mb-6">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3">
                  <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                  </div>
                  <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={onNext}
              className="w-full"
              style={{ backgroundColor: '#1E5126' }}
            >
              {uploadedFiles.length > 0 ? `Continuar con ${uploadedFiles.length} documento${uploadedFiles.length !== 1 ? 's' : ''}` : 'Continuar sin documentos'}
            </Button>
            <Button variant="ghost" onClick={onSkip} className="w-full text-gray-500">
              Completar más tarde
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
