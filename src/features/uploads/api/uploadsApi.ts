import { apiClient } from '@/shared/api/apiClient';
import type { DocumentType, PresignedUrlResponse } from '../types/upload.types';

interface PresignedUrlRequest {
  document_type: DocumentType;
  filename: string;
  content_type: string;
}

export const uploadsApi = {
  getPresignedUrl: (data: PresignedUrlRequest): Promise<PresignedUrlResponse> =>
    apiClient.post<PresignedUrlResponse>('/uploads/presigned-url/', data),

  uploadToR2: async (uploadUrl: string, file: File, contentType: string): Promise<void> => {
    console.log('[uploadToR2] URL length:', uploadUrl.length);
    console.log('[uploadToR2] URL:', uploadUrl);

    const signature = uploadUrl.split('X-Amz-Signature=')[1]?.split('&')[0];
    console.log('[uploadToR2] Signature:', signature);
    console.log('[uploadToR2] Signature length:', signature?.length, '(should be 64)');

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file,
    });

    console.log('[uploadToR2] Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[uploadToR2] Error response:', errorText);
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
  },
};
