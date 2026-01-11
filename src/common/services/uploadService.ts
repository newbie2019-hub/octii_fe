import { apiClient } from '@/common/utils/api';

/**
 * Upload Service
 * Handles file uploads to temporary storage
 */

export interface TempUploadResponse {
  success: boolean;
  message: string;
  data: {
    filename: string;
    original_name: string;
    mime_type: string;
    size: number;
    url: string;
  };
}

export interface DeleteTempResponse {
  success: boolean;
  message: string;
}

export const uploadService = {
  /**
   * Upload a file to temporary storage
   * POST /api/upload/temp
   */
  async uploadToTemp(file: File, type?: 'image' | 'audio' | 'video' | 'document'): Promise<TempUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (type) {
      formData.append('type', type);
    }

    const response = await apiClient.post<TempUploadResponse>('/upload/temp', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Delete a file from temporary storage
   * DELETE /api/upload/temp/{filename}
   */
  async deleteTempFile(filename: string): Promise<DeleteTempResponse> {
    const response = await apiClient.delete<DeleteTempResponse>(`/upload/temp/${filename}`);
    return response.data;
  },
};

