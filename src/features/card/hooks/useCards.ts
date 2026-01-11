import { useState, useEffect, useCallback } from 'react';
import { cardService } from '../services/cardService';
import type { CardsResponse, CardListParams } from '../types/card';
import { toast } from 'sonner';

/**
 * Hook to fetch paginated list of cards for a specific deck
 */
export function useCards(deckId: number, params?: CardListParams) {
  const [data, setData] = useState<CardsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Extract primitive values from params to avoid object reference issues
  const page = params?.page;
  const perPage = params?.per_page;

  const fetchCards = useCallback(async () => {
    console.log('[useCards] fetchCards called', { deckId, page, perPage });
    if (!deckId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await cardService.getCards(deckId, { page, per_page: perPage });
      setData(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch cards');
      setError(error);
      toast.error('Failed to load cards');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [deckId, page, perPage]);

  useEffect(() => {
    console.log('[useCards] useEffect triggered');
    fetchCards();
  }, [fetchCards]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchCards,
  };
}

