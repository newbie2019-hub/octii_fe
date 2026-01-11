export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  avatar?: string;
  provider?: 'google' | 'github' | null;
  status?: string;
  focus_area?: string;
  referral_source?: string;
  onboarding_completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  token_type: 'Bearer';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
}

