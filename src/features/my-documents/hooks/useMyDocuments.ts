import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { myDocumentsApi } from '../api/myDocumentsApi';
import type { DocumentStatus, DocumentType } from '../types/document.types';

const DOCUMENTS_QUERY_KEY = ['my-documents'] as const;

export function useMyDocuments() {
  return useQuery({
    queryKey: [...DOCUMENTS_QUERY_KEY],
    queryFn: () => myDocumentsApi.list(),
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, file }: { type: DocumentType; file: File }) =>
      myDocumentsApi.upload(type, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DOCUMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => myDocumentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DOCUMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
  });
}
