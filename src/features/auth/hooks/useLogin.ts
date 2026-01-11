import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import { useAuthStore } from '@/store/authStore';
import type { LoginValues } from '../schemas/loginSchema';
import type { AuthError } from '@/common/types/auth';
import { AxiosError } from 'axios';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const login = async (data: LoginValues) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      setAuth(response.user, response.token);
      toast.success(response.message || 'Login successful');
      navigate('/');
    } catch (error) {
      const axiosError = error as AxiosError<AuthError>;
      const errorMessage =
        axiosError.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
}

