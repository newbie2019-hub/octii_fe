import { useState, useCallback, useRef, useEffect } from 'react';
import { deckService } from '../services/deckService';
import type { Deck } from '../types/deck';
import { toast } from 'sonner';

/**
 * Hook for fetching a single deck
 */
export function useDeck(id?: number) {
  const [data, setData] = useState<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchedId = useRef<number | null>(null);

  const fetchDeck = useCallback(async (deckId?: number) => {
    const targetId = deckId ?? id;
    if (!targetId) {
      throw new Error('Deck ID is required');
    }

    lastFetchedId.current = targetId;
    setIsLoading(true);
    setError(null);
    try {
      const response = await deckService.getDeck(targetId);
      setData(response.data);
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch deck');
      setError(error);
      toast.error('Failed to load deck');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const refresh = useCallback(() => {
    if (lastFetchedId.current) {
      return fetchDeck(lastFetchedId.current);
    }
    return fetchDeck();
  }, [fetchDeck]);

  // Auto-fetch on mount when id is provided
  useEffect(() => {
    if (id) {
      fetchDeck(id);
    }
  }, [id, fetchDeck]);

  return {
    data,
    isLoading,
    error,
    fetchDeck,
    refresh,
  };
}

