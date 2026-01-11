import { z } from 'zod';

/**
 * Card Validation Schemas
 * Based on API documentation from card-creation-api.md
 */

// Supported card types
export const CARD_TYPES = [
  'basic',
  'cloze',
  'image',
  'audio',
  'multimedia',
  'image_occlusion',
] as const;

export const cardTypeSchema = z.enum(CARD_TYPES);

// Media types
export const MEDIA_TYPES = ['image', 'audio', 'video'] as const;
export const MEDIA_SIDES = ['front', 'back'] as const;

/**
 * Card media input schema for API requests
 * Uses filename from temp upload (two-step process)
 */
export const cardMediaInputSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  media_type: z.enum(MEDIA_TYPES, {
    message: 'Media type is required',
  }),
  side: z.enum(MEDIA_SIDES).default('front').optional(),
  position: z.number().int().min(0).default(0).optional(),
});

/**
 * Image occlusion zone schema
 */
export const occlusionZoneSchema = z.object({
  id: z.string().min(1, 'Zone ID is required'),
  x: z.number().min(0, 'X coordinate must be positive'),
  y: z.number().min(0, 'Y coordinate must be positive'),
  width: z.number().min(1, 'Width must be at least 1'),
  height: z.number().min(1, 'Height must be at least 1'),
  label: z.string().min(1, 'Label is required'),
});

/**
 * Image occlusion data schema (stored as JSON in front field)
 */
export const imageOcclusionDataSchema = z.object({
  type: z.literal('image_occlusion'),
  zones: z.array(occlusionZoneSchema).min(1, 'At least one occlusion zone is required'),
  activeZone: z.string().min(1, 'Active zone is required'),
});

// Create card schema
export const createCardSchema = z.object({
  front: z.string().min(1, 'Front side is required').max(10000, 'Front side too long'),
  back: z.string().min(1, 'Back side is required').max(10000, 'Back side too long'),
  external_id: z.string().max(255, 'External ID too long').optional(),
  card_type: cardTypeSchema.optional().default('basic'),
  media: z.array(cardMediaInputSchema).max(10, 'Maximum 10 media files per card').optional(),
  tag_ids: z.array(z.number().int().positive()).optional(),
});

// Update card schema (all fields optional)
export const updateCardSchema = z.object({
  front: z.string().min(1, 'Front side is required').max(10000, 'Front side too long').optional(),
  back: z.string().min(1, 'Back side is required').max(10000, 'Back side too long').optional(),
  external_id: z.string().max(255, 'External ID too long').optional(),
  card_type: cardTypeSchema.optional(),
  media: z.array(cardMediaInputSchema).max(10, 'Maximum 10 media files per card').optional(),
  tag_ids: z.array(z.number().int().positive()).optional(),
});

// Bulk delete cards schema
export const bulkDeleteCardsSchema = z.object({
  card_ids: z.array(z.number().int().positive()).min(1, 'At least one card ID is required'),
});

// Type inference
export type CardTypeValue = z.infer<typeof cardTypeSchema>;
export type CardMediaInputFormValues = z.infer<typeof cardMediaInputSchema>;
export type OcclusionZoneFormValues = z.infer<typeof occlusionZoneSchema>;
export type ImageOcclusionDataFormValues = z.infer<typeof imageOcclusionDataSchema>;
export type CreateCardFormValues = z.infer<typeof createCardSchema>;
export type UpdateCardFormValues = z.infer<typeof updateCardSchema>;
export type BulkDeleteCardsFormValues = z.infer<typeof bulkDeleteCardsSchema>;

