import { useState, useRef } from 'react';
import { FileText, Check, X, Loader2, AlertCircle, Download, Trash2, FileUp, ShieldCheck, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  useMyDocuments,
  useUploadDocument,
  useDeleteDocument,
  DOCUMENT_CONFIG,
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE,
  type DocumentType,
  type DocumentStatus,
} from '@/features/my-documents';
import { ui } from '@/app/components/AccountShell';
import { DocumentViewerModal } from './DocumentViewerModal';

const PRIMARY_DOCS: DocumentType[] = ['ruc', 'senacsa', 'mapa_acceso'];

interface UploadedDoc {
  id?: number;
  type: DocumentType;
  url: string;
  filename: string;
  uploaded_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function MyDocumentsSection() {
  const { data: documents = [], isLoading, isError, error, refetch } = useMyDocuments();
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const [viewingDoc, setViewingDoc] = useState<DocumentStatus | null>(null);

  if (isLoading) {
    return (
      <div style={{ ...ui.card, textAlign: 'center', padding: '40px 16px' }}>
        <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: '#1E5126' }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ ...ui.card, background: '#FEF2F2', borderColor: '#FECACA' }}>
        <div className="flex items-center gap-2" style={{ color: '#B91C1C', fontWeight: 700 }}>
          <AlertCircle className="w-5 h-5" />
          Error al cargar documentos
        </div>
        <p className="text-sm mt-1" style={{ color: '#B91C1C' }}>
          {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
        <button onClick={() => refetch()} style={{ ...ui.ghostBtn, marginTop: 12 }}>
          Reintentar
        </button>
      </div>
    );
  }

  const allApproved = PRIMARY_DOCS.every((type) =>
    documents.some((d) => d.type === type && d.status === 'approved')
  );

  const hasPending = documents.some((d) => d.status === 'pending' && PRIMARY_DOCS.includes(d.type));
  const hasRejected = documents.some((d) => d.status === 'rejected' && PRIMARY_DOCS.includes(d.type));

  return (
    <div className="flex flex-col gap-3">
      <div
        style={{
          ...ui.card,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: allApproved ? 'rgba(30,81,38,0.04)' : '#FFFBEB',
          borderColor: allApproved ? 'rgba(30,81,38,0.2)' : '#FDE68A',
        }}
      >
        <ShieldCheck
          size={20}
          style={{ color: allApproved ? '#1E5126' : '#B45309', flexShrink: 0 }}
        />
        <div>
          <div className="text-sm font-bold" style={{ color: allApproved ? '#1E5126' : '#92400E' }}>
            {allApproved
              ? 'Productor verificado'
              : hasRejected
                ? 'Documento rechazado, revisalo y reintentá'
                : hasPending
                  ? 'Documentos en revisión'
                  : 'Documentos pendientes'}
          </div>
          <div className="text-xs mt-0.5" style={{ color: allApproved ? '#1E5126' : '#92400E' }}>
            {allApproved
              ? 'Tus documentos están al día. El sello aparece en tus solicitudes.'
              : hasRejected
                ? 'Uno o más documentos fueron rechazados por el equipo. Volvé a subirlos.'
                : hasPending
                  ? 'El equipo de Tropero está revisando tus documentos. Te avisamos cuando estén aprobados.'
                  : 'Subí los documentos requeridos para obtener el sello Verificado.'}
          </div>
        </div>
      </div>

      {PRIMARY_DOCS.map((type) => {
        const config = DOCUMENT_CONFIG[type];
        const doc = documents.find((d) => d.type === type);
        return (
          <DocumentRow
            key={type}
            type={type}
            label={config.label}
            note={config.note}
            required={config.required}
            document={doc ?? null}
            isUploading={uploadMutation.isPending && uploadMutation.variables?.type === type}
            isDeleting={deleteMutation.isPending && doc?.id != null && deleteMutation.variables?.id === doc.id}
            onUpload={(file) => uploadMutation.mutateAsync({ type, file })}
            onDelete={(id) => deleteMutation.mutateAsync({ id })}
            onView={(doc) => setViewingDoc(doc)}
          />
        );
      })}

      {viewingDoc && viewingDoc.url && (
        <DocumentViewerModal
          url={viewingDoc.url}
          filename={viewingDoc.filename ?? 'documento'}
          contentType={viewingDoc.type}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </div>
  );
}

/* ─── Sub-componentes ─── */

interface DocumentRowProps {
  type: DocumentType;
  label: string;
  note: string;
  required: boolean;
  document: DocumentStatus | null;
  isUploading: boolean;
  isDeleting: boolean;
  onUpload: (file: File) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
  onView: (doc: DocumentStatus) => void;
}

function DocumentRow({
  type,
  label,
  note,
  required,
  document,
  isUploading,
  isDeleting,
  onUpload,
  onDelete,
  onView,
}: DocumentRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { border: _cardBorder, ...documentCardStyle } = ui.card;

  const isUploaded = !!document;
  const isPdf = document?.filename?.toLowerCase().endsWith('.pdf');
  const docStatus = document?.status ?? 'pending';

  const statusBadge: Record<'approved' | 'pending' | 'rejected', { color: string; bg: string; label: string }> = {
    approved: { color: '#1E5126', bg: 'rgba(30,81,38,0.08)', label: 'Verificado' },
    pending: { color: '#B45309', bg: '#FEF3E2', label: 'En revisión' },
    rejected: { color: '#B91C1C', bg: '#FEE2E2', label: 'Rechazado' },
  };
  const badge = statusBadge[docStatus];

  const handleFileSelect = async (file: File | undefined) => {
    if (!file) return;

    if (file.size > MAX_DOCUMENT_SIZE) {
      toast.error('El archivo supera el límite de 10MB');
      return;
    }

    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      toast.error(`Tipo de archivo no permitido. Usa PDF, JPG o PNG.`);
      return;
    }

    try {
      await onUpload(file);
      toast.success(`${label} subido correctamente.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al subir';
      toast.error(`No se pudo subir: ${msg}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    console.log('[handleDelete] Iniciando eliminación', { documentId: document?.id, label });
    if (!document?.id) {
      console.error('[handleDelete] No hay document.id, abortando');
      toast.error('No se puede eliminar: falta ID del documento');
      return;
    }
    if (!confirm(`¿Eliminar ${label}?`)) {
      console.log('[handleDelete] Usuario canceló');
      return;
    }
    try {
      await onDelete(document.id);
      console.log('[handleDelete] Eliminado OK');
      toast.success(`${label} eliminado.`);
    } catch (err) {
      console.error('[handleDelete] Error:', err);
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      toast.error(msg);
    }
  };

  if (isUploaded && document) {
    return (
      <div
        style={{
          ...ui.card,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(30,81,38,0.04)',
          borderColor: 'rgba(30,81,38,0.2)',
        }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: isPdf ? '#FEE2E2' : '#DBEAFE' }}
        >
          {isPdf ? <FileText size={20} className="text-red-600" /> : <FileText size={20} className="text-blue-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{label}</span>
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold"
              style={{ color: badge.color, background: badge.bg, padding: '2px 8px', borderRadius: 99 }}
            >
              <Check size={11} /> {badge.label}
            </span>
          </div>
          {document.filename && (
            <div className="text-xs text-gray-500 mt-0.5 truncate">{document.filename}</div>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {document.url && (
            <>
              <button
                onClick={() => onView(document)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Ver documento"
              >
                <Eye size={16} className="text-gray-600" />
              </button>
              <a
                href={document.url}
                download={document.filename ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Descargar"
              >
                <Download size={16} className="text-gray-600" />
              </a>
            </>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Eliminar documento"
          >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} className="text-red-600" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...documentCardStyle,
        borderWidth: 1,
        borderStyle: dragOver ? 'solid' : 'dashed',
        borderColor: dragOver ? '#1E5126' : '#E9E4D8',
        background: dragOver ? 'rgba(30,81,38,0.04)' : '#fff',
        transition: 'all 0.15s',
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files[0]);
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(30,81,38,0.08)' }}
        >
          {isUploading ? (
            <Loader2 size={20} className="text-[#1E5126] animate-spin" />
          ) : (
            <FileUp size={20} className="text-[#1E5126]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{label}</span>
            {required && (
              <span
                className="text-xs font-semibold"
                style={{ color: '#B45309', background: '#FEF3E2', padding: '2px 8px', borderRadius: 99 }}
              >
                Requerido
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{note}</div>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-3 py-1.5 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
          style={{ background: '#1E5126' }}
        >
          {isUploading ? 'Subiendo…' : 'Subir'}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_DOCUMENT_TYPES.join(',')}
        onChange={(e) => handleFileSelect(e.target.files?.[0])}
        className="hidden"
      />
    </div>
  );
}
