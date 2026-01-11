import { useState } from 'react';
import { deckService } from '../services/deckService';
import { toast } from 'sonner';

/**
 * Hook for deleting a deck
 */
export function useDeleteDeck() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteDeck = async (id: number) => {
    setIsDeleting(true);
    setError(null);
    try {
      const response = await deckService.deleteDeck(id);
      toast.success(response.message || 'Deck deleted successfully');
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete deck');
      setError(error);
      toast.error('Failed to delete deck');
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteDeck,
    isDeleting,
    error,
  };
}

