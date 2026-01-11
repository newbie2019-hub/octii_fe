import { apiClient } from '@/common/utils/api';
import type {
  DecksResponse,
  DeckResponse,
  DeleteDeckResponse,
  CreateDeckInput,
  UpdateDeckInput,
  DeckListParams,
} from '../types/deck';

/**
 * Deck Service
 * Handles all API calls related to deck management
 */

export const deckService = {
  /**
   * Get paginated list of decks with optional filters
   */
  async getDecks(params?: DeckListParams): Promise<DecksResponse> {
    const searchParams = new URLSearchParams();

    // Pagination
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.page) searchParams.append('page', params.page.toString());

    // Search & Filter parameters
    if (params?.search) searchParams.append('search', params.search);
    if (params?.created_from) searchParams.append('created_from', params.created_from);
    if (params?.created_to) searchParams.append('created_to', params.created_to);
    if (params?.min_cards !== undefined) searchParams.append('min_cards', params.min_cards.toString());
    if (params?.max_cards !== undefined) searchParams.append('max_cards', params.max_cards.toString());
    if (params?.tags) searchParams.append('tags', params.tags);
    if (params?.studied !== undefined) searchParams.append('studied', params.studied.toString());
    if (params?.last_studied_from) searchParams.append('last_studied_from', params.last_studied_from);
    if (params?.last_studied_to) searchParams.append('last_studied_to', params.last_studied_to);

    const url = `/decks${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await apiClient.get<DecksResponse>(url);
    return response.data;
  },

  /**
   * Get a specific deck by ID
   */
  async getDeck(id: number): Promise<DeckResponse> {
    const response = await apiClient.get<DeckResponse>(`/decks/${id}`);
    return response.data;
  },

  /**
   * Create a new deck with optional cards and media
   */
  async createDeck(data: CreateDeckInput): Promise<DeckResponse> {
    // Check if we need to use FormData (for file uploads)
    const hasFiles = data.cards?.some(card =>
      card.media?.some(media => media.file instanceof File)
    );

    if (hasFiles) {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.parent_id) formData.append('parent_id', data.parent_id.toString());

      // Add tag_ids to FormData
      data.tag_ids?.forEach((tagId, index) => {
        formData.append(`tag_ids[${index}]`, tagId.toString());
      });

      // Add cards to FormData
      data.cards?.forEach((card, cardIndex) => {
        formData.append(`cards[${cardIndex}][front]`, card.front);
        formData.append(`cards[${cardIndex}][back]`, card.back);
        if (card.external_id) {
          formData.append(`cards[${cardIndex}][external_id]`, card.external_id);
        }
        if (card.card_type) {
          formData.append(`cards[${cardIndex}][card_type]`, card.card_type);
        }

        // Add media to FormData
        card.media?.forEach((media, mediaIndex) => {
          formData.append(
            `cards[${cardIndex}][media][${mediaIndex}][media_type]`,
            media.media_type
          );
          if (media.file) {
            formData.append(
              `cards[${cardIndex}][media][${mediaIndex}][file]`,
              media.file
            );
          }
          if (media.base64) {
            formData.append(
              `cards[${cardIndex}][media][${mediaIndex}][base64]`,
              media.base64
            );
            if (media.file_name) {
              formData.append(
                `cards[${cardIndex}][media][${mediaIndex}][file_name]`,
                media.file_name
              );
            }
            if (media.mime_type) {
              formData.append(
                `cards[${cardIndex}][media][${mediaIndex}][mime_type]`,
                media.mime_type
              );
            }
          }
          if (media.position !== undefined) {
            formData.append(
              `cards[${cardIndex}][media][${mediaIndex}][position]`,
              media.position.toString()
            );
          }
        });
      });

      const response = await apiClient.post<DeckResponse>('/decks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

    // Use JSON for non-file uploads
    const response = await apiClient.post<DeckResponse>('/decks', data);
    return response.data;
  },

  /**
   * Update an existing deck
   */
  async updateDeck(id: number, data: UpdateDeckInput): Promise<DeckResponse> {
    // Check if we need to use FormData (for file uploads)
    const hasFiles = data.cards?.some(card =>
      card.media?.some(media => media.file instanceof File)
    );

    if (hasFiles) {
      const formData = new FormData();
      formData.append('_method', 'PUT');

      if (data.name) formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.parent_id) formData.append('parent_id', data.parent_id.toString());

      // Add tag_ids to FormData
      data.tag_ids?.forEach((tagId, index) => {
        formData.append(`tag_ids[${index}]`, tagId.toString());
      });

      // Add cards to FormData
      data.cards?.forEach((card, cardIndex) => {
        formData.append(`cards[${cardIndex}][front]`, card.front);
        formData.append(`cards[${cardIndex}][back]`, card.back);
        if (card.external_id) {
          formData.append(`cards[${cardIndex}][external_id]`, card.external_id);
        }
        if (card.card_type) {
          formData.append(`cards[${cardIndex}][card_type]`, card.card_type);
        }

        // Add media to FormData
        card.media?.forEach((media, mediaIndex) => {
          formData.append(
            `cards[${cardIndex}][media][${mediaIndex}][media_type]`,
            media.media_type
          );
          if (media.file) {
            formData.append(
              `cards[${cardIndex}][media][${mediaIndex}][file]`,
              media.file
            );
          }
          if (media.base64) {
            formData.append(
              `cards[${cardIndex}][media][${mediaIndex}][base64]`,
              media.base64
            );
            if (media.file_name) {
              formData.append(
                `cards[${cardIndex}][media][${mediaIndex}][file_name]`,
                media.file_name
              );
            }
            if (media.mime_type) {
              formData.append(
                `cards[${cardIndex}][media][${mediaIndex}][mime_type]`,
                media.mime_type
              );
            }
          }
          if (media.position !== undefined) {
            formData.append(
              `cards[${cardIndex}][media][${mediaIndex}][position]`,
              media.position.toString()
            );
          }
        });
      });

      const response = await apiClient.post<DeckResponse>(`/decks/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

    // Use JSON for non-file uploads
    const response = await apiClient.put<DeckResponse>(`/decks/${id}`, data);
    return response.data;
  },

  /**
   * Delete a deck
   */
  async deleteDeck(id: number): Promise<DeleteDeckResponse> {
    const response = await apiClient.delete<DeleteDeckResponse>(`/decks/${id}`);
    return response.data;
  },
};

