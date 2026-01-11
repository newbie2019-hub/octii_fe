import { useState } from 'react';
import { toast } from 'sonner';
import { cardService } from '../services/cardService';
import type { UpdateCardInput, PendingMediaFile, CardResponse } from '../types/card';

interface MutateOptions {
  onSuccess?: (response: CardResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to update an existing card
 *
 * Supports two methods:
 * - mutate: Update card with already-uploaded media (pass filenames)
 * - mutateWithMedia: Update card with pending files (handles upload automatically)
 */
export function useUpdateCard(deckId: number, cardId: number) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Update a card with media already uploaded to temp storage
   */
  const mutate = async (
    data: UpdateCardInput,
    options?: MutateOptions
  ): Promise<CardResponse | undefined> => {
    setIsPending(true);
    setError(null);
    try {
      const response = await cardService.updateCard(deckId, cardId, data);
      toast.success(response.message || 'Card updated successfully');
      options?.onSuccess?.(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update card');
      setError(error);
      toast.error(error.message);
      options?.onError?.(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  /**
   * Update a card with pending media files
   * Handles the two-step process: upload files first, then update card
   */
  const mutateWithMedia = async (
    data: Omit<UpdateCardInput, 'media'>,
    pendingFiles: PendingMediaFile[],
    options?: MutateOptions
  ): Promise<CardResponse | undefined> => {
    setIsPending(true);
    setError(null);
    try {
      const response = await cardService.updateCardWithMedia(deckId, cardId, data, pendingFiles);
      toast.success(response.message || 'Card updated successfully');
      options?.onSuccess?.(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update card');
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

