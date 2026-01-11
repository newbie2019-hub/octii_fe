import { api } from "@/common/utils/api";
import type { OnboardingData, OnboardingResponse } from "../types/onboarding";

export const onboardingService = {
  updateOnboarding: async (data: OnboardingData): Promise<OnboardingResponse> => {
    const response = await api.post<OnboardingResponse>("/auth/onboarding", data);
    return response.data;
  },

  completeOnboarding: async (): Promise<OnboardingResponse> => {
    const response = await api.post<OnboardingResponse>("/auth/onboarding/complete");
    return response.data;
  },
};

