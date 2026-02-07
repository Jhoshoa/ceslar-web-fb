/**
 * AuthGuard Component
 *
 * Protects routes that require authentication.
 * Redirects to login page if user is not authenticated.
 */

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * AuthGuard Props
 */
interface AuthGuardProps {
  /** Child components to render if authenticated */
  children: ReactNode;
  /** Require email to be verified */
  requireEmailVerified?: boolean;
}

/**
 * AuthGuard Component
 */
function AuthGuard({ children, requireEmailVerified = false }: AuthGuardProps): ReactNode {
  const { isAuthenticated, isInitialized, user, loading } = useAuth();
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
          Verificando autenticación...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to verify email page if email not verified and required
  if (requireEmailVerified && !user?.emailVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default AuthGuard;
