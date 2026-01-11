import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { type ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user needs onboarding and is not already on the onboarding page
  const needsOnboarding = user && !user.onboarding_completed_at;
  const isOnboardingPage = location.pathname === '/onboarding';

  // If user needs onboarding and is trying to access a protected route that requires onboarding
  if (needsOnboarding && !isOnboardingPage && requireOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user has completed onboarding and is trying to access onboarding page, redirect to dashboard
  if (!needsOnboarding && isOnboardingPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

