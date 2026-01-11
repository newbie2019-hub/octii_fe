import { apiClient } from "@/common/utils/api";
import type {
  Card,
  DueCount,
  IntervalPreviews,
  ReviewRequest,
} from "../types/study-session";

// API response wrapper types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const studySessionService = {
  /**
   * Get the count of cards due for review in a deck
   */
  async getDueCount(deckId: number, tags?: number[]): Promise<DueCount> {
    const params = new URLSearchParams();
    if (tags && tags.length > 0) {
      params.append("tags", tags.join(","));
    }

    const response = await apiClient.get<ApiResponse<DueCount>>(
      `/decks/${deckId}/due${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data.data;
  },

  /**
   * Get the next card to review
   * Returns null if no cards are due
   */
  async getNextCard(deckId: number, tags?: number[]): Promise<Card | null> {
    const params = new URLSearchParams();
    if (tags && tags.length > 0) {
      params.append("tags", tags.join(","));
    }

    const url = `/decks/${deckId}/review/next${params.toString() ? `?${params.toString()}` : ""}`;

    try {
      const response = await apiClient.get<ApiResponse<Card>>(url);
      // Handle both wrapped and unwrapped responses
      const data = response.data;

      // Check if response is wrapped in { success, data }
      if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
        return (data as ApiResponse<Card>).data;
      }

      // Response is the card directly
      return data as unknown as Card;
    } catch (error) {
      // 404 means no cards due - return null
      if ((error as { response?: { status?: number } })?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Submit a card review with rating
   */
  async submitReview(
    cardId: number,
    request: ReviewRequest
  ): Promise<void> {
    await apiClient.post(`/cards/${cardId}/review`, request);
  },

  /**
   * Get interval previews for a card (optional feature)
   */
  async getIntervalPreviews(cardId: number): Promise<IntervalPreviews> {
    const response = await apiClient.get<ApiResponse<IntervalPreviews>>(`/cards/${cardId}/intervals`);
    // Handle both wrapped and unwrapped responses
    const data = response.data;

    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return (data as ApiResponse<IntervalPreviews>).data;
    }

    return data as unknown as IntervalPreviews;
  },
};

