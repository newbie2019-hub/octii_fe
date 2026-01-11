import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import { useAuthStore } from '@/store/authStore';
import type { RegisterValues } from '../schemas/registerSchema';
import type { AuthError } from '@/common/types/auth';
import { AxiosError } from 'axios';

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const register = async (data: RegisterValues) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      setAuth(response.user, response.token);
      toast.success(response.message || 'Registration successful');
      navigate('/');
    } catch (error) {
      const axiosError = error as AxiosError<AuthError>;
      const errorMessage =
        axiosError.response?.data?.message ||
        'Registration failed. Please try again.';

      // Handle validation errors
      if (axiosError.response?.data?.errors) {
        const errors = axiosError.response.data.errors;
        Object.values(errors).forEach((errorArray) => {
          errorArray.forEach((msg) => toast.error(msg));
        });
      } else {
        toast.error(errorMessage);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading };
}

