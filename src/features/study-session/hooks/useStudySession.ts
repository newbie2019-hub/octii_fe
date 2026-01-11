import { useState, useCallback, useEffect, useRef } from "react";
import { studySessionService } from "../services/studySessionService";
import { sessionStorage } from "../services/sessionStorage";
import type {
  StudySessionConfig,
  StudySessionState,
  Card,
  SessionSummary,
} from "../types/study-session";

export function useStudySession() {
  const [state, setState] = useState<StudySessionState>({
    config: null,
    session: {
      status: "idle",
      cardsReviewed: 0,
      currentCard: null,
      cardShowTime: 0,
      isFlipped: false,
    },
    stats: {
      ratings: { 1: 0, 2: 0, 3: 0, 4: 0 },
      totalDurationMs: 0,
      startTime: 0,
    },
    cache: {
      intervals: null,
      nextCard: null,
    },
  });

  // Track paused duration for accurate timing
  const pausedAtRef = useRef<number | null>(null);
  const pausedDurationRef = useRef<number>(0);

  // Handle visibility changes (pause timer when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (state.session.status !== "studying") return;

      if (document.hidden) {
        // User switched tabs - pause timer
        pausedAtRef.current = Date.now();
        if (state.config) {
          sessionStorage.updateStatus(state.config.deckId, "paused");
        }
      } else {
        // User returned - resume timer
        if (pausedAtRef.current) {
          pausedDurationRef.current += Date.now() - pausedAtRef.current;
          pausedAtRef.current = null;
        }
        if (state.config) {
          sessionStorage.updateStatus(state.config.deckId, "active");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state.session.status, state.config]);

  // Check for recoverable session on mount
  const checkRecoverableSession = useCallback((deckId: number) => {
    return sessionStorage.getRecoveryInfo(deckId);
  }, []);

  const startConfiguration = useCallback((deckId: number, deckName: string) => {
    setState((prev) => ({
      ...prev,
      session: { ...prev.session, status: "configuring" },
    }));
  }, []);

  const startSession = useCallback(
    async (config: StudySessionConfig) => {
      // Reset pause tracking
      pausedAtRef.current = null;
      pausedDurationRef.current = 0;

      setState((prev) => ({
        ...prev,
        config,
        session: {
          ...prev.session,
          status: "loading",
          cardsReviewed: 0,
          isFlipped: false,
        },
        stats: {
          ratings: { 1: 0, 2: 0, 3: 0, 4: 0 },
          totalDurationMs: 0,
          startTime: Date.now(),
        },
      }));

      // Create session in localStorage
      sessionStorage.create(config.deckId, config.deckName, {
        maxCards: config.maxCards,
        selectedTags: config.selectedTags,
        showIntervals: config.showIntervals,
      });

      try {
        const nextCard = await studySessionService.getNextCard(
          config.deckId,
          config.selectedTags.length > 0 ? config.selectedTags : undefined
        );

        if (!nextCard || !nextCard.id) {
          sessionStorage.updateStatus(config.deckId, "completed");
          setState((prev) => ({
            ...prev,
            session: { ...prev.session, status: "complete" },
          }));
          return;
        }

        // Update localStorage with current card
        sessionStorage.updateCurrentCard(config.deckId, nextCard.id);

        setState((prev) => ({
          ...prev,
          session: {
            ...prev.session,
            status: "studying",
            currentCard: nextCard,
            cardShowTime: Date.now(),
          },
        }));

        // Prefetch interval previews if enabled
        if (config.showIntervals && nextCard.id) {
          try {
            const intervals = await studySessionService.getIntervalPreviews(
              nextCard.id
            );
            setState((prev) => ({
              ...prev,
              cache: { ...prev.cache, intervals },
            }));
          } catch (error) {
            console.error("Failed to fetch intervals:", error);
          }
        }
      } catch (error) {
        console.error("Failed to start session:", error);
        sessionStorage.updateStatus(config.deckId, "abandoned");
        setState((prev) => ({
          ...prev,
          session: { ...prev.session, status: "abandoned" },
        }));
      }
    },
    []
  );

  const flipCard = useCallback(() => {
    setState((prev) => ({
      ...prev,
      session: { ...prev.session, isFlipped: true },
    }));
  }, []);

  const rateCard = useCallback(
    async (rating: 1 | 2 | 3 | 4) => {
      const { currentCard, cardShowTime, cardsReviewed } = state.session;
      const { config } = state;

      if (!currentCard || !currentCard.id || !config) return;

      // Calculate duration excluding paused time
      let durationMs = Date.now() - cardShowTime - pausedDurationRef.current;
      if (pausedAtRef.current) {
        durationMs -= (Date.now() - pausedAtRef.current);
      }
      // Clamp to valid range (0 to 1 hour max)
      durationMs = Math.min(Math.max(0, durationMs), 3600000);

      // Reset pause tracking for next card
      pausedAtRef.current = null;
      pausedDurationRef.current = 0;

      // Queue review to localStorage first (offline resilience)
      sessionStorage.addReview(config.deckId, {
        cardId: currentCard.id,
        rating,
        durationMs,
        reviewedAt: Date.now(),
      });

      try {
        // Submit review to API
        await studySessionService.submitReview(currentCard.id, {
          rating,
          duration_ms: durationMs,
        });

        // Mark as synced in localStorage
        sessionStorage.markSynced(config.deckId, [currentCard.id]);

        // Update stats
        setState((prev) => ({
          ...prev,
          session: {
            ...prev.session,
            cardsReviewed: cardsReviewed + 1,
          },
          stats: {
            ...prev.stats,
            ratings: {
              ...prev.stats.ratings,
              [rating]: prev.stats.ratings[rating] + 1,
            },
            totalDurationMs: prev.stats.totalDurationMs + durationMs,
          },
          cache: {
            ...prev.cache,
            intervals: null, // Clear old intervals
          },
        }));

        // Check if limit reached
        if (cardsReviewed + 1 >= config.maxCards) {
          sessionStorage.updateStatus(config.deckId, "completed");
          setState((prev) => ({
            ...prev,
            session: { ...prev.session, status: "complete", isFlipped: false },
          }));
          return;
        }

        // Get next card
        setState((prev) => ({
          ...prev,
          session: { ...prev.session, status: "loading" },
        }));

        const nextCard = await studySessionService.getNextCard(
          config.deckId,
          config.selectedTags.length > 0 ? config.selectedTags : undefined
        );

        if (!nextCard || !nextCard.id) {
          sessionStorage.updateStatus(config.deckId, "completed");
          setState((prev) => ({
            ...prev,
            session: { ...prev.session, status: "complete", isFlipped: false },
          }));
          return;
        }

        // Update localStorage with new current card
        sessionStorage.updateCurrentCard(config.deckId, nextCard.id);

        setState((prev) => ({
          ...prev,
          session: {
            ...prev.session,
            status: "studying",
            currentCard: nextCard,
            cardShowTime: Date.now(),
            isFlipped: false,
          },
        }));

        // Prefetch intervals for next card
        if (config.showIntervals && nextCard.id) {
          try {
            const intervals = await studySessionService.getIntervalPreviews(
              nextCard.id
            );
            setState((prev) => ({
              ...prev,
              cache: { ...prev.cache, intervals },
            }));
          } catch (error) {
            console.error("Failed to fetch intervals:", error);
          }
        }
      } catch (error) {
        console.error("Failed to rate card:", error);
        // Review is already queued in localStorage, will sync later
        // Still update local state for immediate feedback
        setState((prev) => ({
          ...prev,
          session: {
            ...prev.session,
            cardsReviewed: cardsReviewed + 1,
          },
          stats: {
            ...prev.stats,
            ratings: {
              ...prev.stats.ratings,
              [rating]: prev.stats.ratings[rating] + 1,
            },
            totalDurationMs: prev.stats.totalDurationMs + durationMs,
          },
        }));
      }
    },
    [state.session, state.config]
  );

  const pauseSession = useCallback(() => {
    const { config } = state;
    if (config) {
      sessionStorage.updateStatus(config.deckId, "paused");
    }
    setState((prev) => ({
      ...prev,
      session: { ...prev.session, status: "paused" },
    }));
  }, [state.config]);

  const resumeSession = useCallback(() => {
    const { config } = state;
    if (config) {
      sessionStorage.updateStatus(config.deckId, "active");
    }
    setState((prev) => ({
      ...prev,
      session: { ...prev.session, status: "studying" },
    }));
  }, [state.config]);

  const exitSession = useCallback(() => {
    const { config } = state;
    if (config) {
      sessionStorage.updateStatus(config.deckId, "abandoned");
    }
    setState((prev) => ({
      ...prev,
      session: { ...prev.session, status: "abandoned" },
    }));
  }, [state.config]);

  const resetSession = useCallback(() => {
    const { config } = state;
    // Clear localStorage on complete reset
    if (config) {
      sessionStorage.clear(config.deckId);
    }
    pausedAtRef.current = null;
    pausedDurationRef.current = 0;
    setState({
      config: null,
      session: {
        status: "idle",
        cardsReviewed: 0,
        currentCard: null,
        cardShowTime: 0,
        isFlipped: false,
      },
      stats: {
        ratings: { 1: 0, 2: 0, 3: 0, 4: 0 },
        totalDurationMs: 0,
        startTime: 0,
      },
      cache: {
        intervals: null,
        nextCard: null,
      },
    });
  }, [state.config]);

  /**
   * Submit any unsynced reviews from localStorage
   */
  const syncPendingReviews = useCallback(async (deckId: number) => {
    const unsyncedReviews = sessionStorage.getUnsyncedReviews(deckId);

    if (unsyncedReviews.length === 0) return { success: true, submitted: 0 };

    const results = {
      success: true,
      submitted: 0,
      failed: [] as number[],
    };

    for (const review of unsyncedReviews) {
      try {
        await studySessionService.submitReview(review.cardId, {
          rating: review.rating,
          duration_ms: review.durationMs,
        });
        sessionStorage.markSynced(deckId, [review.cardId]);
        results.submitted++;
      } catch (error) {
        results.failed.push(review.cardId);
        results.success = false;
      }
    }

    return results;
  }, []);

  const getSessionSummary = useCallback((): SessionSummary => {
    const { cardsReviewed } = state.session;
    const { ratings, totalDurationMs, startTime } = state.stats;

    const goodOrEasy = ratings[3] + ratings[4];
    const accuracy = cardsReviewed > 0 ? (goodOrEasy / cardsReviewed) * 100 : 0;

    return {
      cardsReviewed,
      sessionDuration: totalDurationMs,
      ratings,
      accuracy: Math.round(accuracy),
      startTime,
      endTime: Date.now(),
    };
  }, [state]);

  return {
    state,
    startConfiguration,
    startSession,
    flipCard,
    rateCard,
    pauseSession,
    resumeSession,
    exitSession,
    resetSession,
    getSessionSummary,
    checkRecoverableSession,
    syncPendingReviews,
  };
}

