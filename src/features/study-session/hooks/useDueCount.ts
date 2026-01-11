import { useState, useEffect, useCallback } from "react";
import { studySessionService } from "../services/studySessionService";
import type { DueCount } from "../types/study-session";
import { toast } from "sonner";

export function useDueCount(deckId: number, tags?: number[]) {
  const [data, setData] = useState<DueCount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const tagsString = tags?.join(",") || "";

  const fetchDueCount = useCallback(async () => {
    if (!deckId) return;

    setIsLoading(true);
    setError(null);
    try {
      const dueCount = await studySessionService.getDueCount(
        deckId,
        tags && tags.length > 0 ? tags : undefined
      );
      setData(dueCount);
      return dueCount;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch due count");
      setError(error);
      toast.error("Failed to load due count");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [deckId, tagsString]);

  useEffect(() => {
    fetchDueCount();
  }, [fetchDueCount]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDueCount,
  };
}

