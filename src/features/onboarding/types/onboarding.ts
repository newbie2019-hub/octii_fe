import type { User } from "@/common/types/auth";

export interface OnboardingData {
  status?: string;
  focus_area?: string;
  referral_source?: string;
}

export interface OnboardingResponse {
  message: string;
  user: User;
}

