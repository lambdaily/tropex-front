import { useState } from 'react';
import { X, Download, ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';

interface DocumentViewerModalProps {
  url: string;
  filename: string;
  contentType?: string;
  onClose: () => void;
}

export function DocumentViewerModal({ url, filename, contentType, onClose }: DocumentViewerModalProps) {
  const isPdf = contentType?.includes('pdf') || filename.toLowerCase().endsWith('.pdf');
  const isImage = contentType?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">{filename}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Visor de documentos</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <a
              href={url}
              download={filename}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Descargar"
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={16} className="text-gray-700" />
            </a>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Abrir en nueva pestaña"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={16} className="text-gray-700" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X size={16} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 overflow-auto bg-gray-100">
          {isPdf ? (
            <PdfViewer url={url} />
          ) : isImage ? (
            <ImageViewer url={url} />
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <p className="text-gray-700 mb-4">
                  No se puede previsualizar este tipo de archivo.
                </p>
                <a
                  href={url}
                  download={filename}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E5126] text-white rounded-lg font-semibold"
                >
                  <Download size={16} /> Descargar archivo
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PdfViewer({ url }: { url: string }) {
  const [fullUrl, setFullUrl] = useState(url);
  const [scale, setScale] = useState(100);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-b border-gray-200">
        <button
          onClick={() => setScale((s) => Math.max(50, s - 10))}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Reducir"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs font-mono w-12 text-center">{scale}%</span>
        <button
          onClick={() => setScale((s) => Math.min(200, s + 10))}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Aumentar"
        >
          <ZoomIn size={16} />
        </button>
        <div className="w-px h-5 bg-gray-300 mx-2" />
        <button
          onClick={() => setFullUrl(url + '#toolbar=0')}
          className="px-2 py-1 text-xs hover:bg-gray-100 rounded"
        >
          Limpiar
        </button>
      </div>
      <div className="flex-1 overflow-auto bg-gray-200">
        <iframe
          src={`${url}#zoom=${scale}`}
          className="w-full bg-white"
          style={{ height: '100%', minHeight: '600px' }}
          title="PDF Viewer"
        />
      </div>
    </div>
  );
}

function ImageViewer({ url }: { url: string }) {
  const [scale, setScale] = useState(100);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-b border-gray-200">
        <button
          onClick={() => setScale((s) => Math.max(25, s - 10))}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Reducir"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs font-mono w-12 text-center">{scale}%</span>
        <button
          onClick={() => setScale((s) => Math.min(200, s + 10))}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Aumentar"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setScale(100)}
          className="px-2 py-1 text-xs hover:bg-gray-100 rounded"
        >
          Reset
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <img
          src={url}
          alt="Document preview"
          className="max-w-full max-h-full object-contain shadow-lg"
          style={{ transform: `scale(${scale / 100})`, transformOrigin: 'center' }}
        />
      </div>
    </div>
  );
}
