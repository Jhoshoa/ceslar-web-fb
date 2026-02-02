/**
 * ChurchGuard Component
 *
 * Protects routes that require church membership or specific church roles.
 * Gets church ID from URL params or props.
 */

import { ReactNode } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import type { ChurchRole } from '@ceslar/shared-types';

/**
 * Route params
 */
interface ChurchParams {
  churchId?: string;
  id?: string;
}

/**
 * ChurchGuard Props
 */
interface ChurchGuardProps {
  /** Child components to render if authorized */
  children: ReactNode;
  /** Church ID (if not provided, uses route param) */
  churchId?: string;
  /** Array of allowed church roles */
  allowedRoles?: ChurchRole[];
  /** Just require any membership (ignore roles) */
  requireMembership?: boolean;
  /** Shortcut for admin/pastor roles */
  requireAdmin?: boolean;
  /** Where to redirect if unauthorized */
  fallbackPath?: string;
}

/**
 * ChurchGuard Component
 */
function ChurchGuard({
  children,
  churchId: propChurchId,
  allowedRoles = [],
  requireMembership = false,
  requireAdmin = false,
  fallbackPath = '/',
}: ChurchGuardProps): ReactNode {
  const {
    isAuthenticated,
    isInitialized,
    loading,
    isSystemAdmin,
    isChurchAdmin,
    isChurchMember,
    user,
  } = useAuth();
  const location = useLocation();
  const params = useParams<ChurchParams>();

  // Get church ID from props or URL params
  const churchId = propChurchId || params.churchId || params.id;

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
          Verificando acceso...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if church ID is available
  if (!churchId) {
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
        <Alert severity="error">
          <Typography variant="body2">No se pudo determinar la iglesia.</Typography>
        </Alert>
        <Button variant="contained" onClick={() => window.history.back()}>
          Volver
        </Button>
      </Box>
    );
  }

  // System admins always have access
  if (isSystemAdmin) {
    return <>{children}</>;
  }

  // Check church admin requirement
  if (requireAdmin) {
    if (!isChurchAdmin(churchId)) {
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
          <Alert severity="warning">
            <Typography variant="h6" gutterBottom>
              Acceso Restringido
            </Typography>
            <Typography variant="body2">
              Esta sección está disponible solo para administradores de la iglesia.
            </Typography>
          </Alert>
          <Button variant="contained" onClick={() => window.history.back()}>
            Volver
          </Button>
        </Box>
      );
    }
    return <>{children}</>;
  }

  // Check membership requirement
  if (requireMembership) {
    if (!isChurchMember(churchId)) {
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
          <Alert severity="info">
            <Typography variant="h6" gutterBottom>
              Membresía Requerida
            </Typography>
            <Typography variant="body2">
              Debes ser miembro de esta iglesia para acceder a esta sección.
            </Typography>
          </Alert>
          <Button variant="contained" href={`/churches/${churchId}`}>
            Ver Iglesia
          </Button>
        </Box>
      );
    }
    return <>{children}</>;
  }

  // Check specific roles (if any specified)
  if (allowedRoles.length > 0) {
    const userRole = user?.churchRoles?.[churchId];
    const hasAllowedRole = userRole && allowedRoles.includes(userRole);

    if (!hasAllowedRole) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
}

export default ChurchGuard;
