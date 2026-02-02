/**
 * RoleGuard Component
 *
 * Protects routes that require specific roles.
 * Can check for system roles or church-specific roles.
 */

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import type { SystemRole, ChurchRole } from '@ceslar/shared-types';

/**
 * RoleGuard Props
 */
interface RoleGuardProps {
  /** Child components to render if authorized */
  children: ReactNode;
  /** Array of allowed system roles */
  allowedRoles?: (SystemRole | ChurchRole)[];
  /** Church ID for church-specific role checks */
  churchId?: string;
  /** Array of allowed church roles */
  allowedChurchRoles?: ChurchRole[];
  /** Where to redirect if unauthorized */
  fallbackPath?: string;
  /** Show access denied message instead of redirect */
  showAccessDenied?: boolean;
}

/**
 * RoleGuard Component
 */
function RoleGuard({
  children,
  allowedRoles = [],
  churchId,
  allowedChurchRoles = [],
  fallbackPath = '/',
  showAccessDenied = false,
}: RoleGuardProps): ReactNode {
  const { isAuthenticated, isInitialized, loading, hasRole, hasChurchRole, isSystemAdmin } =
    useAuth();
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
          Verificando permisos...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check authorization
  let isAuthorized = false;

  // System admins always have access
  if (isSystemAdmin) {
    isAuthorized = true;
  }
  // Check system roles
  else if (allowedRoles.length > 0) {
    isAuthorized = allowedRoles.some((role) => hasRole(role));
  }
  // Check church-specific roles
  else if (churchId && allowedChurchRoles.length > 0) {
    isAuthorized = allowedChurchRoles.some((role) => hasChurchRole(churchId, role));
  }

  // Handle unauthorized access
  if (!isAuthorized) {
    if (showAccessDenied) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            gap: 2,
            p: 3,
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            <Typography variant="h6" gutterBottom>
              Acceso Denegado
            </Typography>
            <Typography variant="body2">
              No tienes los permisos necesarios para acceder a esta página.
            </Typography>
          </Alert>
          <Button variant="contained" onClick={() => window.history.back()}>
            Volver
          </Button>
        </Box>
      );
    }

    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}

export default RoleGuard;
