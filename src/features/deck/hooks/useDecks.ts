import { useState, useCallback, useRef } from 'react';
import { deckService } from '../services/deckService';
import type { DeckListParams, DeckFilterParams, Deck, PaginationMeta } from '../types/deck';
import { toast } from 'sonner';

/**
 * Hook for fetching and managing deck list with infinite scroll and filtering support
 */
export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Store current filters for pagination
  const currentFiltersRef = useRef<DeckFilterParams>({});

  const fetchDecks = useCallback(async (params?: DeckListParams & { append?: boolean }) => {
    const { append = false, ...fetchParams } = params ?? {};

    // Store filters (excluding pagination) for subsequent page fetches
    if (!append) {
      const { page, per_page, ...filters } = fetchParams;
      currentFiltersRef.current = filters;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await deckService.getDecks(fetchParams);

      if (append) {
        // Append new data for infinite scroll
        setDecks((prev) => [...prev, ...response.data]);
      } else {
        // Replace data for initial load or refresh
        setDecks(response.data);
      }

      setMeta(response.meta);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch decks');
      setError(error);
      toast.error('Failed to load decks');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchNextPage = useCallback(async () => {
    if (!meta || meta.current_page >= meta.last_page || isLoading) {
      return null;
    }

    // Include current filters when fetching next page
    return fetchDecks({
      ...currentFiltersRef.current,
      page: meta.current_page + 1,
      per_page: meta.per_page,
      append: true,
    });
  }, [meta, isLoading, fetchDecks]);

  const refresh = useCallback(() => {
    // Refresh with current filters
    return fetchDecks(currentFiltersRef.current);
  }, [fetchDecks]);

  const hasNextPage = meta ? meta.current_page < meta.last_page : false;

  return {
    decks,
    meta,
    isLoading,
    error,
    hasNextPage,
    fetchDecks,
    fetchNextPage,
    refresh,
  };
}

