import { useState } from 'react';
import { toast } from 'sonner';
import { cardService } from '../services/cardService';
import type { BulkDeleteCardsInput } from '../types/card';

/**
 * Hook to bulk delete multiple cards
 */
export function useBulkDeleteCards(deckId: number) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    data: BulkDeleteCardsInput,
    options?: {
      onSuccess?: (response: any) => void;
      onError?: (error: Error) => void;
    }
  ) => {
    setIsPending(true);
    setError(null);
    try {
      const response = await cardService.bulkDeleteCards(deckId, data);
      toast.success(response.message || `${response.deleted_count} card(s) deleted successfully`);
      options?.onSuccess?.(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete cards');
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
    isPending,
    error,
  };
}

