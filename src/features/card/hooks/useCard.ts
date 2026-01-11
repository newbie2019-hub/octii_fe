import { useState, useEffect, useCallback } from 'react';
import { cardService } from '../services/cardService';
import type { CardResponse } from '../types/card';
import { toast } from 'sonner';

/**
 * Hook to fetch a specific card from a deck
 */
export function useCard(deckId: number, cardId: number) {
  const [data, setData] = useState<CardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCard = useCallback(async () => {
    console.log('[useCard] fetchCard called', { deckId, cardId });
    if (!deckId || !cardId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await cardService.getCard(deckId, cardId);
      setData(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch card');
      setError(error);
      toast.error('Failed to load card');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [deckId, cardId]);

  useEffect(() => {
    console.log('[useCard] useEffect triggered');
    fetchCard();
  }, [fetchCard]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchCard,
  };
}

