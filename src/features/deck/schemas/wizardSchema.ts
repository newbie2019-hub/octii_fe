import { z } from 'zod';

/**
 * Deck Creation Wizard Schemas
 * Based on API documentation from card-creation-api.md
 */

// Supported card types - simplified to 3 main types
export const WIZARD_CARD_TYPES = [
  'basic',
  'cloze',
  'image_occlusion',
] as const;

// Step 1: Deck Info Schema
export const deckInfoSchema = z.object({
  name: z.string().min(1, 'Deck name is required').max(255, 'Deck name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  tag_ids: z.array(z.number().int().positive()).optional(),
  cover: z.instanceof(File).optional(),
});

// Step 2: Card Creation Schema
// For basic cards: front and back are HTML content or media references
// For cloze cards: front contains the cloze text with {{c1::text}} syntax, back is auto-generated
// For image_occlusion: front is JSON with zones, back is the image URL
export const wizardCardSchema = z.object({
  front: z.string().max(50000, 'Front side too long'),
  back: z.string().max(50000, 'Back side too long'),
  card_type: z.enum(WIZARD_CARD_TYPES).default('basic'),
  external_id: z.string().max(255, 'External ID too long').optional(),
});

// Type inference
export type DeckInfoFormValues = z.infer<typeof deckInfoSchema>;
export type WizardCardFormValues = z.infer<typeof wizardCardSchema>;
export type WizardCardType = (typeof WIZARD_CARD_TYPES)[number];

// Card types for the dropdown with descriptions
export const CARD_TYPES = [
  {
    value: 'basic',
    label: 'Basic',
    description: 'Front and back with text or media',
    icon: 'Layers',
  },
  {
    value: 'cloze',
    label: 'Cloze Deletion',
    description: 'Fill in the blank from text',
    icon: 'BracesIcon',
  },
  {
    value: 'image_occlusion',
    label: 'Image Occlusion',
    description: 'Hide parts of an image',
    icon: 'Image',
  },
] as const;

