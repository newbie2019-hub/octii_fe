import { useState } from 'react';
import { deckService } from '../services/deckService';
import type { CreateDeckInput } from '../types/deck';
import { toast } from 'sonner';

/**
 * Hook for creating a new deck
 */
export function useCreateDeck() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createDeck = async (data: CreateDeckInput) => {
    setIsCreating(true);
    setError(null);
    try {
      const response = await deckService.createDeck(data);
      toast.success(response.message || 'Deck created successfully');
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create deck');
      setError(error);
      toast.error('Failed to create deck');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createDeck,
    isCreating,
    error,
  };
}

