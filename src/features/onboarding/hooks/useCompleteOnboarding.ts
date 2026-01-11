import { useState } from "react";
import { toast } from "sonner";
import { onboardingService } from "../services/onboardingService";
import { useAuthStore } from "@/store/authStore";

export const useCompleteOnboarding = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

  const mutate = async (
    options?: {
      onSuccess?: (response: any) => void;
      onError?: (error: Error) => void;
      updateStore?: boolean; // Set to false to prevent immediate store update (avoids ProtectedRoute redirect)
    }
  ) => {
    setIsPending(true);
    setError(null);
    try {
      const response = await onboardingService.completeOnboarding();
      // Only update the user in the store if updateStore is not explicitly false
      // This allows the caller to control when the redirect happens
      if (options?.updateStore !== false) {
        setUser(response.user);
      }
      options?.onSuccess?.(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to complete onboarding");
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

