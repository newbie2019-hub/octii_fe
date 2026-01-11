/**
 * Tag Feature Types
 * Based on API documentation from tags-api-documentation.md
 */

export interface Tag {
  id: number;
  name: string;
  color: string;
  cards_count?: number;
  decks_count?: number;
  created_at: string;
  updated_at: string;
}

export interface TagsResponse {
  success: boolean;
  data: Tag[];
}

export interface TagResponse {
  success: boolean;
  data: Tag;
  message?: string;
}

export interface DeleteTagResponse {
  success: boolean;
  message: string;
}

export interface CreateTagInput {
  name: string;
  color?: string;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
}

