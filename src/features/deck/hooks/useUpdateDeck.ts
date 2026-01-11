import { useState } from 'react';
import { deckService } from '../services/deckService';
import type { UpdateDeckInput } from '../types/deck';
import { toast } from 'sonner';

/**
 * Hook for updating an existing deck
 */
export function useUpdateDeck() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateDeck = async (id: number, data: UpdateDeckInput) => {
    setIsUpdating(true);
    setError(null);
    try {
      const response = await deckService.updateDeck(id, data);
      toast.success(response.message || 'Deck updated successfully');
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update deck');
      setError(error);
      toast.error('Failed to update deck');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateDeck,
    isUpdating,
    error,
  };
}

