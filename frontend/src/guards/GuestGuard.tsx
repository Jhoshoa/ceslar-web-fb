/**
 * GuestGuard Component
 *
 * Protects routes that should only be accessible to non-authenticated users.
 * Redirects to home page (or intended destination) if user is authenticated.
 */

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Location state with return URL
 */
interface LocationState {
  from?: {
    pathname: string;
  };
}

/**
 * GuestGuard Props
 */
interface GuestGuardProps {
  /** Child components to render if not authenticated */
  children: ReactNode;
  /** Where to redirect authenticated users (default: '/') */
  redirectTo?: string;
}

/**
 * GuestGuard Component
 */
function GuestGuard({ children, redirectTo = '/' }: GuestGuardProps): ReactNode {
  const { isAuthenticated, isInitialized, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth - content-level, not full page
  if (!isInitialized || loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Cargando...
        </Typography>
      </Box>
    );
  }

  // Redirect to intended destination or home if authenticated
  if (isAuthenticated) {
    // Check if there's a return URL in location state
    const state = location.state as LocationState | null;
    const from = state?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

export default GuestGuard;
