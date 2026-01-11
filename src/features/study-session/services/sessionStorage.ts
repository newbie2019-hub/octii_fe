/**
 * LocalStorage persistence for study sessions
 * Provides offline resilience and crash recovery
 */

const STORAGE_KEY_PREFIX = "octii_study_session_";

export interface QueuedReview {
  cardId: number;
  rating: 1 | 2 | 3 | 4;
  durationMs: number;
  reviewedAt: number;
  synced: boolean;
}

export interface StoredSession {
  // Session metadata
  sessionId: string;
  deckId: number;
  deckName: string;
  startedAt: number;
  lastUpdatedAt: number;

  // Configuration
  config: {
    maxCards: number;
    selectedTags: number[];
    showIntervals: boolean;
  };

  // Current progress
  progress: {
    cardsStudied: number;
    currentCardId: number | null;
    currentCardStartTime: number;
  };

  // Queued reviews (not yet synced to server)
  reviewQueue: QueuedReview[];

  // Session statistics (calculated locally)
  stats: {
    ratings: { 1: number; 2: number; 3: number; 4: number };
    totalDurationMs: number;
  };

  // Session status
  status: "active" | "paused" | "completed" | "abandoned";

  // Version for migrations
  version: number;
}

function generateUUID(): string {
  return crypto.randomUUID?.() ||
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

export class StudySessionStorage {
  private getKey(deckId: number): string {
    return `${STORAGE_KEY_PREFIX}${deckId}`;
  }

  /**
   * Create a new session in storage
   */
  create(
    deckId: number,
    deckName: string,
    config: StoredSession["config"]
  ): StoredSession {
    const session: StoredSession = {
      sessionId: generateUUID(),
      deckId,
      deckName,
      startedAt: Date.now(),
      lastUpdatedAt: Date.now(),
      config,
      progress: {
        cardsStudied: 0,
        currentCardId: null,
        currentCardStartTime: Date.now(),
      },
      reviewQueue: [],
      stats: {
        ratings: { 1: 0, 2: 0, 3: 0, 4: 0 },
        totalDurationMs: 0,
      },
      status: "active",
      version: 1,
    };

    this.save(deckId, session);
    return session;
  }

  /**
   * Save session state to localStorage
   */
  save(deckId: number, session: StoredSession): void {
    const key = this.getKey(deckId);
    const data = {
      ...session,
      lastUpdatedAt: Date.now(),
    };

    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save session to localStorage:", error);
    }
  }

  /**
   * Load session state from localStorage
   */
  load(deckId: number): StoredSession | null {
    const key = this.getKey(deckId);
    const data = localStorage.getItem(key);

    if (!data) return null;

    try {
      return JSON.parse(data) as StoredSession;
    } catch (error) {
      console.error("Failed to parse session data:", error);
      return null;
    }
  }

  /**
   * Check if there's an active session for recovery
   */
  hasActiveSession(deckId: number): boolean {
    const session = this.load(deckId);
    if (!session) return false;

    // Session is recoverable if:
    // 1. Status is active/paused (not completed/abandoned)
    // 2. Has unsynced reviews
    // 3. Started within last 24 hours
    const isRecent = Date.now() - session.startedAt < 24 * 60 * 60 * 1000;
    const hasUnsynced = session.reviewQueue?.some((r) => !r.synced);
    const isActive = ["active", "paused"].includes(session.status);

    return isRecent && (hasUnsynced || isActive);
  }

  /**
   * Add a review to the queue
   */
  addReview(deckId: number, review: Omit<QueuedReview, "synced">): void {
    const session = this.load(deckId);
    if (!session) return;

    session.reviewQueue.push({
      ...review,
      synced: false,
    });

    // Update stats
    session.stats.ratings[review.rating]++;
    session.stats.totalDurationMs += review.durationMs;
    session.progress.cardsStudied++;

    this.save(deckId, session);
  }

  /**
   * Update current card info
   */
  updateCurrentCard(deckId: number, cardId: number): void {
    const session = this.load(deckId);
    if (!session) return;

    session.progress.currentCardId = cardId;
    session.progress.currentCardStartTime = Date.now();

    this.save(deckId, session);
  }

  /**
   * Mark reviews as synced
   */
  markSynced(deckId: number, cardIds: number[]): void {
    const session = this.load(deckId);
    if (!session) return;

    session.reviewQueue = session.reviewQueue.map((review) => {
      if (cardIds.includes(review.cardId)) {
        return { ...review, synced: true };
      }
      return review;
    });

    this.save(deckId, session);
  }

  /**
   * Get unsynced reviews
   */
  getUnsyncedReviews(deckId: number): QueuedReview[] {
    const session = this.load(deckId);
    if (!session) return [];

    return session.reviewQueue.filter((r) => !r.synced);
  }

  /**
   * Update session status
   */
  updateStatus(deckId: number, status: StoredSession["status"]): void {
    const session = this.load(deckId);
    if (!session) return;

    session.status = status;
    this.save(deckId, session);
  }

  /**
   * Clear session from storage (after successful completion)
   */
  clear(deckId: number): void {
    const key = this.getKey(deckId);
    localStorage.removeItem(key);
  }

  /**
   * Get all active sessions (for dashboard recovery prompt)
   */
  getAllActiveSessions(): StoredSession[] {
    const sessions: StoredSession[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || "");
          const deckId = parseInt(key.replace(STORAGE_KEY_PREFIX, ""), 10);
          if (this.hasActiveSession(deckId)) {
            sessions.push(data);
          }
        } catch {
          // Skip invalid entries
        }
      }
    }

    return sessions;
  }

  /**
   * Get recovery info for a deck
   */
  getRecoveryInfo(deckId: number): {
    hasRecoverable: boolean;
    session?: StoredSession;
    unsyncedCount?: number;
    lastUpdated?: string;
  } {
    const session = this.load(deckId);

    if (!session) {
      return { hasRecoverable: false };
    }

    const unsyncedReviews = session.reviewQueue.filter((r) => !r.synced);

    if (unsyncedReviews.length === 0 && session.status === "completed") {
      return { hasRecoverable: false };
    }

    return {
      hasRecoverable: this.hasActiveSession(deckId),
      session,
      unsyncedCount: unsyncedReviews.length,
      lastUpdated: new Date(session.lastUpdatedAt).toLocaleString(),
    };
  }
}

// Singleton instance
export const sessionStorage = new StudySessionStorage();

