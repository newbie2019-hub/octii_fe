import { useState } from 'react';
import { tagService } from '../services/tagService';
import type { CreateTagInput, Tag } from '../types/tag';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Hook for creating new tags
 */
export function useCreateTag() {
  const [isCreating, setIsCreating] = useState(false);

  const createTag = async (data: CreateTagInput): Promise<Tag> => {
    setIsCreating(true);
    try {
      const response = await tagService.createTag(data);
      toast.success('Tag created successfully');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const message = error.response?.data?.message || 'Failed to create tag';
      toast.error(message);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return { createTag, isCreating };
}

