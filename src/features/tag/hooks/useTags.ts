import { useState, useCallback, useEffect } from 'react';
import { tagService } from '../services/tagService';
import type { Tag } from '../types/tag';
import { toast } from 'sonner';

/**
 * Hook for fetching and managing tags
 */
export function useTags() {
  const [data, setData] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await tagService.getTags();
      setData(response.data);
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch tags');
      setError(error);
      toast.error('Failed to load tags');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTagToList = useCallback((tag: Tag) => {
    setData((prev) => [...prev, tag]);
  }, []);

  const removeTagFromList = useCallback((tagId: number) => {
    setData((prev) => prev.filter((t) => t.id !== tagId));
  }, []);

  const updateTagInList = useCallback((tag: Tag) => {
    setData((prev) => prev.map((t) => (t.id === tag.id ? tag : t)));
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    data,
    isLoading,
    error,
    fetchTags,
    addTagToList,
    removeTagFromList,
    updateTagInList,
  };
}

