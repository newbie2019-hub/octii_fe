import { apiClient } from '@/common/utils/api';
import { uploadService } from '@/common/services/uploadService';
import type {
  CardsResponse,
  CardResponse,
  DeleteCardResponse,
  BulkDeleteCardsResponse,
  CreateCardInput,
  UpdateCardInput,
  BulkDeleteCardsInput,
  CardListParams,
  PendingMediaFile,
  UploadedMedia,
  CardMediaInput,
} from '../types/card';

/**
 * Card Service
 * Handles all API calls related to card management
 *
 * Card creation with media follows a two-step process:
 * 1. Upload files to temporary storage via uploadService
 * 2. Create card with the returned filenames
 */

export const cardService = {
  /**
   * Get paginated list of cards for a specific deck
   * GET /api/decks/{deck}/cards
   */
  async getCards(deckId: number, params?: CardListParams): Promise<CardsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.page) searchParams.append('page', params.page.toString());

    const url = `/decks/${deckId}/cards${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await apiClient.get<CardsResponse>(url);
    return response.data;
  },

  /**
   * Get a specific card from a deck
   * GET /api/decks/{deck}/cards/{card}
   */
  async getCard(deckId: number, cardId: number): Promise<CardResponse> {
    const response = await apiClient.get<CardResponse>(`/decks/${deckId}/cards/${cardId}`);
    return response.data;
  },

  /**
   * Upload pending media files to temporary storage
   * Returns array of uploaded media ready for card creation
   */
  async uploadMediaFiles(pendingFiles: PendingMediaFile[]): Promise<UploadedMedia[]> {
    const uploadedMedia: UploadedMedia[] = [];

    for (const pending of pendingFiles) {
      const response = await uploadService.uploadToTemp(pending.file, pending.media_type);
      uploadedMedia.push({
        filename: response.data.filename,
        original_name: response.data.original_name,
        media_type: pending.media_type,
        side: pending.side,
        position: pending.position,
        url: response.data.url,
      });
    }

    return uploadedMedia;
  },

  /**
   * Create a new card in a specific deck
   * POST /api/decks/{deck}/cards
   *
   * Media should already be uploaded to temp storage.
   * Pass the filenames from the upload response.
   */
  async createCard(deckId: number, data: CreateCardInput): Promise<CardResponse> {
    const response = await apiClient.post<CardResponse>(`/decks/${deckId}/cards`, data);
    return response.data;
  },

  /**
   * Create a card with pending media files (handles upload automatically)
   * This is a convenience method that combines upload + create
   */
  async createCardWithMedia(
    deckId: number,
    data: Omit<CreateCardInput, 'media'>,
    pendingFiles: PendingMediaFile[]
  ): Promise<CardResponse> {
    let media: CardMediaInput[] | undefined;

    if (pendingFiles.length > 0) {
      const uploadedMedia = await this.uploadMediaFiles(pendingFiles);
      media = uploadedMedia.map((m) => ({
        filename: m.filename,
        media_type: m.media_type,
        side: m.side,
        position: m.position,
      }));
    }

    return this.createCard(deckId, { ...data, media });
  },

  /**
   * Update an existing card
   * PUT /api/decks/{deck}/cards/{card}
   */
  async updateCard(
    deckId: number,
    cardId: number,
    data: UpdateCardInput
  ): Promise<CardResponse> {
    const response = await apiClient.put<CardResponse>(
      `/decks/${deckId}/cards/${cardId}`,
      data
    );
    return response.data;
  },

  /**
   * Update a card with pending media files (handles upload automatically)
   */
  async updateCardWithMedia(
    deckId: number,
    cardId: number,
    data: Omit<UpdateCardInput, 'media'>,
    pendingFiles: PendingMediaFile[]
  ): Promise<CardResponse> {
    let media: CardMediaInput[] | undefined;

    if (pendingFiles.length > 0) {
      const uploadedMedia = await this.uploadMediaFiles(pendingFiles);
      media = uploadedMedia.map((m) => ({
        filename: m.filename,
        media_type: m.media_type,
        side: m.side,
        position: m.position,
      }));
    }

    return this.updateCard(deckId, cardId, { ...data, media });
  },

  /**
   * Delete a specific card from a deck
   * DELETE /api/decks/{deck}/cards/{card}
   */
  async deleteCard(deckId: number, cardId: number): Promise<DeleteCardResponse> {
    const response = await apiClient.delete<DeleteCardResponse>(
      `/decks/${deckId}/cards/${cardId}`
    );
    return response.data;
  },

  /**
   * Toggle card suspension status
   * POST /api/decks/{deck}/cards/{card}/toggle-suspend
   */
  async toggleCardSuspension(deckId: number, cardId: number): Promise<CardResponse> {
    const response = await apiClient.post<CardResponse>(
      `/decks/${deckId}/cards/${cardId}/toggle-suspend`
    );
    return response.data;
  },

  /**
   * Bulk delete multiple cards from a deck
   * POST /api/decks/{deck}/cards/bulk-delete
   */
  async bulkDeleteCards(
    deckId: number,
    data: BulkDeleteCardsInput
  ): Promise<BulkDeleteCardsResponse> {
    const response = await apiClient.post<BulkDeleteCardsResponse>(
      `/decks/${deckId}/cards/bulk-delete`,
      data
    );
    return response.data;
  },
};

