import { z } from "zod";

export const StudyConfigSchema = z.object({
  maxCards: z
    .number()
    .min(1, "Must study at least 1 card")
    .max(100, "Cannot exceed 100 cards per session"),
  selectedTags: z.array(z.number()).default([]),
  showIntervals: z.boolean().default(true),
});

export type StudyConfigValues = z.infer<typeof StudyConfigSchema>;



