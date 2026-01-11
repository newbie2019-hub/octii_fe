import { z } from 'zod';

/**
 * Tag Validation Schemas
 */

// Hex color regex pattern
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Create tag schema
export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must be 50 characters or less'),
  color: z
    .string()
    .regex(hexColorRegex, 'Invalid hex color format (e.g., #3B82F6)')
    .optional(),
});

// Update tag schema
export const updateTagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must be 50 characters or less')
    .optional(),
  color: z
    .string()
    .regex(hexColorRegex, 'Invalid hex color format (e.g., #3B82F6)')
    .optional(),
});

// Type inference
export type CreateTagFormValues = z.infer<typeof createTagSchema>;
export type UpdateTagFormValues = z.infer<typeof updateTagSchema>;

