import { apiClient } from '@/common/utils/api';
import type {
  TagsResponse,
  TagResponse,
  DeleteTagResponse,
  CreateTagInput,
  UpdateTagInput,
} from '../types/tag';

/**
 * Tag Service
 * Handles all API calls related to tag management
 */

export const tagService = {
  /**
   * Get all tags for the authenticated user
   */
  async getTags(): Promise<TagsResponse> {
    const response = await apiClient.get<TagsResponse>('/tags');
    return response.data;
  },

  /**
   * Get a specific tag by ID
   */
  async getTag(id: number): Promise<TagResponse> {
    const response = await apiClient.get<TagResponse>(`/tags/${id}`);
    return response.data;
  },

  /**
   * Create a new tag
   */
  async createTag(data: CreateTagInput): Promise<TagResponse> {
    const response = await apiClient.post<TagResponse>('/tags', data);
    return response.data;
  },

  /**
   * Update an existing tag
   */
  async updateTag(id: number, data: UpdateTagInput): Promise<TagResponse> {
    const response = await apiClient.put<TagResponse>(`/tags/${id}`, data);
    return response.data;
  },

  /**
   * Delete a tag
   */
  async deleteTag(id: number): Promise<DeleteTagResponse> {
    const response = await apiClient.delete<DeleteTagResponse>(`/tags/${id}`);
    return response.data;
  },
};

