import { apiClient } from '@/shared/api/apiClient';
import type { DocumentStatus, DocumentType } from '../types/document.types';

// Mapeo entre los tipos semánticos del frontend y los valores que acepta el backend
// en el endpoint /api/uploads/presigned-url/ (choices del PresignedUrlRequestSerializer).
const DOCUMENT_TYPE_BACKEND_MAP: Record<DocumentType, string> = {
  ruc: 'ruc',
  senacsa: 'senacsa',
  mapa_acceso: 'access_map',
  cedula: 'cedula',
  licencia: 'vehicle_photo',
};

function mapDocumentTypeToBackend(type: DocumentType): string {
  return DOCUMENT_TYPE_BACKEND_MAP[type];
}

export const myDocumentsApi = {
  list: async (): Promise<DocumentStatus[]> => {
    const data = await apiClient.get<{
      uploaded_documents: Array<{
        id: number;
        document_type: DocumentType;
        object_key: string;
        public_url: string;
        original_filename: string;
        file_size: number;
        content_type: string;
        status: 'pending' | 'approved' | 'rejected';
        created_at: string;
      }>;
    }>('/auth/me/');
    const docs = data.uploaded_documents ?? [];
    return docs.map((d) => ({
      id: d.id,
      type: d.document_type,
      uploaded: true,
      url: d.public_url,
      filename: d.original_filename,
      uploaded_at: d.created_at,
      status: d.status,
    }));
  },

  upload: async (
    type: DocumentType,
    file: File
  ): Promise<{ url: string; filename: string; object_key: string; id: number }> => {
    const backendType = mapDocumentTypeToBackend(type);

    const presigned = await apiClient.post<{
      upload_url: string;
      object_key: string;
      public_url: string;
      expires_in: number;
    }>('/uploads/presigned-url/', {
      document_type: backendType,
      filename: file.name,
      content_type: file.type,
    });

    const response = await fetch(presigned.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const document = await apiClient.post<{ id: number }>('/user-documents/', {
      document_type: type,
      object_key: presigned.object_key,
      public_url: presigned.public_url,
      original_filename: file.name,
      file_size: file.size,
      content_type: file.type,
    });

    return {
      url: presigned.public_url,
      filename: file.name,
      object_key: presigned.object_key,
      id: document.id,
    };
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/user-documents/${id}/`);
  },
};
