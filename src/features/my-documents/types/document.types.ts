export type DocumentType = 'ruc' | 'senacsa' | 'mapa_acceso' | 'cedula' | 'licencia';
export type DocumentReviewStatus = 'pending' | 'approved' | 'rejected';

export interface DocumentStatus {
  id?: number;
  type: DocumentType;
  label?: string;
  uploaded: boolean;
  url: string | null;
  filename: string | null;
  uploaded_at: string | null;
  status?: DocumentReviewStatus;
}

export const DOCUMENT_CONFIG: Record<DocumentType, { label: string; note: string; required: boolean }> = {
  ruc: {
    label: 'Constancia de RUC',
    note: 'Verificado por Tropero',
    required: true,
  },
  senacsa: {
    label: 'Registro SENACSA del establecimiento',
    note: 'Habilita el sello Verificado',
    required: true,
  },
  mapa_acceso: {
    label: 'Mapa de acceso al establecimiento',
    note: 'Ayuda a los transportistas a llegar',
    required: false,
  },
  cedula: {
    label: 'Cédula de identidad',
    note: 'Identificación del productor',
    required: false,
  },
  licencia: {
    label: 'Licencia de conducir',
    note: 'Requerida para transportistas',
    required: false,
  },
};

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
