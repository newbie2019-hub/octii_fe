import { api } from '@/common/utils/api';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from '@/common/types/auth';

export const authService = {
  /**
   * Register a new user account
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Logout from current device
   */
  async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/logout');
    return response.data;
  },

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/logout-all');
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },

  /**
   * Get OAuth redirect URL
   */
  async getSocialRedirect(
    provider: 'google' | 'github'
  ): Promise<{ redirect_url: string }> {
    const response = await api.get<{ redirect_url: string }>(
      `/auth/${provider}/redirect`
    );
    return response.data;
  },

  /**
   * Unlink social provider
   */
  async unlinkSocial(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      '/auth/unlink-social'
    );
    return response.data;
  },
};

