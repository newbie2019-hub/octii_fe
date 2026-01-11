import { z } from "zod";

export const onboardingSchema = z.object({
  status: z.string().max(255).optional(),
  focus_area: z.string().max(255).optional(),
  referral_source: z.string().max(255).optional(),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

