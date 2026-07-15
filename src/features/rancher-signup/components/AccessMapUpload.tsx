import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { useFileUpload } from '@/features/uploads';

interface AccessMapUploadProps {
  publicUrl: string | null;
  filename: string | null;
  onUploadComplete: (publicUrl: string, objectKey: string, filename: string) => void;
  onRemove: () => void;
}

export function AccessMapUpload({ publicUrl, filename, onUploadComplete, onRemove }: AccessMapUploadProps) {
  const { upload, isUploading, error } = useFileUpload({
    documentType: 'access_map',
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo supera el límite de 10MB');
      return;
    }

    const result = await upload(file);
    if (result) {
      onUploadComplete(result.publicUrl, result.objectKey, file.name);
    }

    e.target.value = '';
  };

  if (publicUrl && filename) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{filename}</p>
            <p className="text-xs text-green-700">Subido correctamente</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 hover:bg-green-100 rounded-lg transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-[#1E5126] hover:bg-gray-50 transition-colors ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 mb-2 text-gray-500 animate-spin" />
              <p className="mb-1 text-sm text-gray-700 font-medium">Subiendo...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-1 text-sm text-gray-700 font-medium">
                Haz clic para subir el mapa de acceso
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, PDF (máx. 10MB)
              </p>
            </>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}
