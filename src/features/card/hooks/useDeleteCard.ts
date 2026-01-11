import { useState } from 'react';
import { toast } from 'sonner';
import { cardService } from '../services/cardService';

/**
 * Hook to delete a card
 */
export function useDeleteCard(deckId: number) {
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
      const response = await cardService.deleteCard(deckId, cardId);
      toast.success(response.message || 'Card deleted successfully');
      options?.onSuccess?.(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete card');
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

