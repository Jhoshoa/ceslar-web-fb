/**
 * AuthGuard Component
 *
 * Protects routes that require authentication.
 * Redirects to login page if user is not authenticated.
 */

import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * AuthGuard Component
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {boolean} props.requireEmailVerified - Require email to be verified
 * @returns {React.ReactNode}
 */
function AuthGuard({ children, requireEmailVerified = false }) {
  const { isAuthenticated, isInitialized, user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (!isInitialized || loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
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

  return children;
}

AuthGuard.propTypes = {
  children: PropTypes.node.isRequired,
  requireEmailVerified: PropTypes.bool,
};

export default AuthGuard;
