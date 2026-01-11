import { useState } from "react";
import { toast } from "sonner";
import { onboardingService } from "../services/onboardingService";
import type { OnboardingData } from "../types/onboarding";
import { useAuthStore } from "@/store/authStore";

export const useOnboarding = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

  const mutate = async (
    data: OnboardingData,
    options?: {
      onSuccess?: (response: any) => void;
      onError?: (error: Error) => void;
    }
  ) => {
    setIsPending(true);
    setError(null);
    try {
      const response = await onboardingService.updateOnboarding(data);
      // Update the user in the store with the new onboarding data
      setUser(response.user);
      options?.onSuccess?.(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update onboarding");
      setError(error);
      toast.error(error.message);
      options?.onError?.(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutate,
    isPending,
    error,
  };
};

