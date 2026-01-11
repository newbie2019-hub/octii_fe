import { useState } from 'react';
import { toast } from 'sonner';
import { cardService } from '../services/cardService';
import type { CreateCardInput, PendingMediaFile, CardResponse } from '../types/card';

interface MutateOptions {
  onSuccess?: (response: CardResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to create a new card
 *
 * Supports two methods:
 * - mutate: Create card with already-uploaded media (pass filenames)
 * - mutateWithMedia: Create card with pending files (handles upload automatically)
 */
export function useCreateCard(deckId: number) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Create a card with media already uploaded to temp storage
   */
  const mutate = async (
    data: CreateCardInput,
    options?: MutateOptions
  ): Promise<CardResponse | undefined> => {
    setIsPending(true);
    setError(null);
    try {
      const response = await cardService.createCard(deckId, data);
      toast.success(response.message || 'Card created successfully');
      options?.onSuccess?.(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create card');
      setError(error);
      toast.error(error.message);
      options?.onError?.(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  /**
   * Create a card with pending media files
   * Handles the two-step process: upload files first, then create card
   */
  const mutateWithMedia = async (
    data: Omit<CreateCardInput, 'media'>,
    pendingFiles: PendingMediaFile[],
    options?: MutateOptions
  ): Promise<CardResponse | undefined> => {
    setIsPending(true);
    setError(null);
    try {
      const response = await cardService.createCardWithMedia(deckId, data, pendingFiles);
      toast.success(response.message || 'Card created successfully');
      options?.onSuccess?.(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create card');
      setError(error);
      toast.error(error.message);
      options?.onError?.(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutate,
    mutateWithMedia,
    isPending,
    error,
  };
}

