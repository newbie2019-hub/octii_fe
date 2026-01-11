import { useState } from 'react';
import { tagService } from '../services/tagService';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message: string;
}

/**
 * Hook for deleting tags
 */
export function useDeleteTag() {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteTag = async (id: number): Promise<void> => {
    setIsDeleting(true);
    try {
      await tagService.deleteTag(id);
      toast.success('Tag deleted successfully');
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const message = error.response?.data?.message || 'Failed to delete tag';
      toast.error(message);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteTag, isDeleting };
}

