import { api } from '@/common/utils/api';
import type { Import, ImportStartResponse, ImportHistoryResponse } from '../types/import';

export const importService = {
  /**
   * Upload and start import of an Anki deck file
   */
  async uploadDeck(file: File): Promise<ImportStartResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<ImportStartResponse>('/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  },

  /**
   * Get the status of a specific import
   */
  async getImportStatus(importId: number): Promise<Import> {
    const { data } = await api.get<Import>(`/import/${importId}`);
    return data;
  },

  /**
   * Get import history for the authenticated user
   */
  async getImportHistory(page = 1, perPage = 15): Promise<ImportHistoryResponse> {
    const { data } = await api.get<ImportHistoryResponse>('/import', {
      params: {
        page,
        per_page: perPage,
      },
    });
    return data;
  },
};

