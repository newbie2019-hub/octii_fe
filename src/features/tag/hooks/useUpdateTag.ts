import { useState } from 'react';
import { tagService } from '../services/tagService';
import type { UpdateTagInput, Tag } from '../types/tag';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Hook for updating existing tags
 */
export function useUpdateTag() {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateTag = async (id: number, data: UpdateTagInput): Promise<Tag> => {
    setIsUpdating(true);
    try {
      const response = await tagService.updateTag(id, data);
      toast.success('Tag updated successfully');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const message = error.response?.data?.message || 'Failed to update tag';
      toast.error(message);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateTag, isUpdating };
}

