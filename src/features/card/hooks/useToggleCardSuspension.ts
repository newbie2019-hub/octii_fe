import { useState } from 'react';
import { toast } from 'sonner';
import { cardService } from '../services/cardService';

/**
 * Hook to toggle card suspension
 */
export function useToggleCardSuspension(deckId: number) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    cardId: number,
    options?: {
      onSuccess?: (response: any) => void;
      onError?: (error: Error) => void;
    }
  ) => {
    setIsPending(true);
    setError(null);
    try {
      const response = await cardService.toggleCardSuspension(deckId, cardId);
      toast.success(response.message || 'Card status updated');
      options?.onSuccess?.(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update card status');
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

