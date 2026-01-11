/**
 * Deck Feature Types
 * Based on API documentation from deck-api-documentation.md
 */

export type MediaType = 'image' | 'audio' | 'video';

export interface CardMedia {
  id: number;
  media_type: MediaType;
  file_name: string;
  file_size: number;
  mime_type: string;
  position: number;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: number;
  deck_id: number;
  front: string;
  back: string;
  external_id: string | null;
  card_type: string | null;
  suspended_at: string | null;
  media: CardMedia[];
  created_at: string;
  updated_at: string;
}

export interface DeckTag {
  id: number;
  name: string;
  color: string;
}

export interface DeckStatistics {
  mastery_percentage: number;
  average_retention: number;
  new_count: number;
  learning_count: number;
  review_count: number;
  relearning_count: number;
  mastered_count: number;
  suspended_count: number;
  leech_count: number;
  daily_review_count: number;
  daily_new_count: number;
  last_calculated_at: string;
}

export interface Deck {
  id: number;
  user_id: number;
  parent_id: number | null;
  name: string;
  description: string | null;
  cards_count: number;
  cards?: Card[];
  tags: DeckTag[];
  due_count: number;
  statistics: DeckStatistics | null;
  mastery_percentage: number;
  new_count: number;
  accuracy: number | null;
  last_studied_at: string | null;
  has_been_studied: boolean;
  parent?: Deck | null;
  children: Deck[];
  children_count: number;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface DecksResponse {
  success: boolean;
  data: Deck[];
  meta: PaginationMeta;
}

export interface DeckResponse {
  success: boolean;
  data: Deck;
  message?: string;
}

export interface DeleteDeckResponse {
  success: boolean;
  message: string;
}

// Form types for creating/updating decks
export interface CardMediaInput {
  media_type: MediaType;
  file?: File;
  base64?: string;
  file_name?: string;
  mime_type?: string;
  position?: number;
}

export interface CardInput {
  front: string;
  back: string;
  external_id?: string;
  card_type?: string;
  media?: CardMediaInput[];
}

export interface CreateDeckInput {
  name: string;
  description?: string;
  parent_id?: number;
  tag_ids?: number[];
  cards?: CardInput[];
}

export interface UpdateDeckInput extends Partial<CreateDeckInput> {
  name?: string;
  cover?: string; // Temp filename from /api/upload/temp
}

// Query parameters for filtering and searching decks
export interface DeckFilterParams {
  search?: string;
  created_from?: string;
  created_to?: string;
  min_cards?: number;
  max_cards?: number;
  tags?: string;
  studied?: boolean;
  last_studied_from?: string;
  last_studied_to?: string;
}

export interface DeckListParams extends DeckFilterParams {
  per_page?: number;
  page?: number;
}

