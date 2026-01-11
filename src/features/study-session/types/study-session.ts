export interface StudySessionConfig {
  deckId: number;
  deckName: string;
  maxCards: number;
  selectedTags: number[];
  showIntervals: boolean;
}

export interface Card {
  id: number;
  deck_id: number;
  front: string;
  back: string;
  tags: Array<{ id: number; name: string }>;
  due_date: string | null;
  interval: number;
  easiness: number;
  repetitions: number;
  is_suspended: boolean;
}

export interface IntervalPreviews {
  again: string;
  hard: string;
  good: string;
  easy: string;
}

export type SessionStatus =
  | "idle"
  | "configuring"
  | "loading"
  | "studying"
  | "paused"
  | "complete"
  | "abandoned";

export interface StudySessionState {
  config: StudySessionConfig | null;
  session: {
    status: SessionStatus;
    cardsReviewed: number;
    currentCard: Card | null;
    cardShowTime: number;
    isFlipped: boolean;
  };
  stats: {
    ratings: { 1: number; 2: number; 3: number; 4: number };
    totalDurationMs: number;
    startTime: number;
  };
  cache: {
    intervals: IntervalPreviews | null;
    nextCard: Card | null;
  };
}

export interface SessionSummary {
  cardsReviewed: number;
  sessionDuration: number;
  ratings: { 1: number; 2: number; 3: number; 4: number };
  accuracy: number;
  startTime: number;
  endTime: number;
}

// API Response Types
export interface DueCount {
  deck_id: number;
  due_count: number;
  new_count: number;
  total_available: number;
}

export interface DueCountResponse {
  success: boolean;
  data: DueCount;
  message?: string;
}

export interface CardResponse {
  success: boolean;
  data: Card;
  message?: string;
}

export interface IntervalPreviewsResponse {
  success: boolean;
  data: IntervalPreviews;
  message?: string;
}

export interface ReviewRequest {
  rating: 1 | 2 | 3 | 4;
  duration_ms: number;
}

export interface ReviewResponse {
  success: boolean;
  message?: string;
}

