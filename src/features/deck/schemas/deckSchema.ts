import { z } from 'zod';

/**
 * Deck Validation Schemas
 * Based on API documentation from card-creation-api.md
 */

// Supported card types
export const DECK_CARD_TYPES = [
  'basic',
  'cloze',
  'image',
  'audio',
  'multimedia',
  'image_occlusion',
] as const;

// Media types and sides
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

// Card schema for deck creation with cards
export const cardSchema = z.object({
  front: z.string().min(1, 'Front side is required').max(10000, 'Front side too long'),
  back: z.string().min(1, 'Back side is required').max(10000, 'Back side too long'),
  external_id: z.string().max(255, 'External ID too long').optional(),
  card_type: z.enum(DECK_CARD_TYPES).optional().default('basic'),
  media: z.array(cardMediaInputSchema).max(10, 'Maximum 10 media files per card').optional(),
  tag_ids: z.array(z.number().int().positive()).optional(),
});

// Create deck schema
export const createDeckSchema = z.object({
  name: z.string().min(1, 'Deck name is required').max(255, 'Deck name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  parent_id: z.number().int().positive().optional(),
  tag_ids: z.array(z.number().int().positive()).optional(),
  cards: z.array(cardSchema).max(1000, 'Maximum 1000 cards per deck').optional(),
});

// Update deck schema (all fields optional)
export const updateDeckSchema = z.object({
  name: z.string().min(1, 'Deck name is required').max(255, 'Deck name too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  parent_id: z.number().int().positive().optional(),
  tag_ids: z.array(z.number().int().positive()).optional(),
  cards: z.array(cardSchema).max(1000, 'Maximum 1000 cards per deck').optional(),
  cover: z.string().optional(), // Temp filename from /api/upload/temp
});

// Type inference
export type CardMediaInputFormValues = z.infer<typeof cardMediaInputSchema>;
export type CardFormValues = z.infer<typeof cardSchema>;
export type CreateDeckFormValues = z.infer<typeof createDeckSchema>;
export type UpdateDeckFormValues = z.infer<typeof updateDeckSchema>;
export type DeckCardType = (typeof DECK_CARD_TYPES)[number];

