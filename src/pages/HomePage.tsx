import { Navigate } from 'react-router-dom';

/**
 * @deprecated Use DashboardPage instead. This component redirects to /dashboard
 */
export function HomePage() {
  return <Navigate to="/dashboard" replace />;
}

