import { useState } from 'react';
import { uploadsApi } from '../api/uploadsApi';
import type { DocumentType, PresignedUrlResponse } from '../types/upload.types';

interface UseFileUploadOptions {
  documentType: DocumentType;
  onSuccess?: (publicUrl: string, objectKey: string) => void;
  onError?: (error: Error) => void;
}

interface UploadResult {
  publicUrl: string;
  objectKey: string;
}

export function useFileUpload({ documentType, onSuccess, onError }: UseFileUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<UploadResult | null> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const presigned = await uploadsApi.getPresignedUrl({
        document_type: documentType,
        filename: file.name,
        content_type: file.type,
      });

      setProgress(50);

      await uploadsApi.uploadToR2(presigned.upload_url, file, file.type);

      setProgress(100);
      onSuccess?.(presigned.public_url, presigned.object_key);

      return {
        publicUrl: presigned.public_url,
        objectKey: presigned.object_key,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al subir archivo');
      setError(error.message);
      onError?.(error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, progress, error };
}
