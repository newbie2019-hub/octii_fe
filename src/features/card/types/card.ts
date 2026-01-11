/**
 * Card Feature Types
 * Based on API documentation from card-creation-api.md
 */

export type MediaType = 'image' | 'audio' | 'video';
export type MediaSide = 'front' | 'back';
export type CardType = 'basic' | 'cloze' | 'image' | 'audio' | 'multimedia' | 'image_occlusion';

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
  media_count?: number;
  media?: CardMedia[];
  tags?: Tag[];
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CardsResponse {
  success: boolean;
  data: Card[];
  meta: PaginationMeta;
}

export interface CardResponse {
  success: boolean;
  data: Card;
  message?: string;
}

export interface DeleteCardResponse {
  success: boolean;
  message: string;
}

export interface BulkDeleteCardsResponse {
  success: boolean;
  message: string;
  deleted_count: number;
}

/**
 * Shape types for occlusion zones
 */
export type OcclusionShape = 'rectangle' | 'ellipse' | 'freehand';

/**
 * Image Occlusion Zone for image_occlusion card type
 * Stored as JSON in the front field
 */
export interface OcclusionZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  shape?: OcclusionShape; // Default: 'rectangle'
  points?: { x: number; y: number }[]; // For freehand shape
}

export interface ImageOcclusionData {
  type: 'image_occlusion';
  zones: OcclusionZone[];
  activeZone: string;
}

/**
 * Media input for API requests
 * Uses filename from temp upload (two-step process)
 */
export interface CardMediaInput {
  filename: string;        // Temp filename from upload/temp endpoint
  media_type: MediaType;
  side?: MediaSide;        // 'front' or 'back' (default: 'front')
  position?: number;       // Display order (default: 0)
}

/**
 * Local media state for UI before upload
 */
export interface PendingMediaFile {
  file: File;
  media_type: MediaType;
  side: MediaSide;
  position: number;
  previewUrl?: string;     // For local preview
}

/**
 * Uploaded media ready for card creation
 */
export interface UploadedMedia {
  filename: string;
  original_name: string;
  media_type: MediaType;
  side: MediaSide;
  position: number;
  url: string;
}

export interface CreateCardInput {
  front: string;
  back: string;
  external_id?: string;
  card_type?: CardType | string;
  media?: CardMediaInput[];
  tag_ids?: number[];
}

export interface UpdateCardInput extends Partial<CreateCardInput> {
  front?: string;
  back?: string;
}

export interface BulkDeleteCardsInput {
  card_ids: number[];
}

// Query parameters
export interface CardListParams {
  per_page?: number;
  page?: number;
}

