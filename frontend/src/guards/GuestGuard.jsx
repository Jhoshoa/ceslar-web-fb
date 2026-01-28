/**
 * GuestGuard Component
 *
 * Protects routes that should only be accessible to non-authenticated users.
 * Redirects to home page (or intended destination) if user is authenticated.
 */

import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * GuestGuard Component
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if not authenticated
 * @param {string} props.redirectTo - Where to redirect authenticated users (default: '/')
 * @returns {React.ReactNode}
 */
function GuestGuard({ children, redirectTo = '/' }) {
  const { isAuthenticated, isInitialized, loading } = useAuth();
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
          Cargando...
        </Typography>
      </Box>
    );
  }

  // Redirect to intended destination or home if authenticated
  if (isAuthenticated) {
    // Check if there's a return URL in location state
    const from = location.state?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return children;
}

GuestGuard.propTypes = {
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
};

export default GuestGuard;
