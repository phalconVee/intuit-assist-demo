import { useState, useEffect } from 'react';
import { MockTaxApiService, TaxDocument, UploadResponse } from '../services/mockApi';

export const useTaxDocuments = (year?: number) => {
  const [documents, setDocuments] = useState<TaxDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await MockTaxApiService.getTaxDocuments(year);
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, type: TaxDocument['type']): Promise<UploadResponse> => {
    try {
      const response = await MockTaxApiService.uploadDocument(file, type);
      if (response.success) {
        // Refresh documents list
        await fetchDocuments();
      }
      return response;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const deleteDocument = async (id: string): Promise<boolean> => {
    try {
      const success = await MockTaxApiService.deleteDocument(id);
      if (success) {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      return false;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [year]);

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    refetch: fetchDocuments
  };
};