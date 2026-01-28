/**
 * ChurchGuard Component
 *
 * Protects routes that require church membership or specific church roles.
 * Gets church ID from URL params or props.
 */

import { Navigate, useLocation, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';

/**
 * ChurchGuard Component
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string} props.churchId - Church ID (if not provided, uses route param)
 * @param {string[]} props.allowedRoles - Array of allowed church roles
 * @param {boolean} props.requireMembership - Just require any membership (ignore roles)
 * @param {boolean} props.requireAdmin - Shortcut for admin/pastor roles
 * @param {string} props.fallbackPath - Where to redirect if unauthorized
 * @returns {React.ReactNode}
 */
function ChurchGuard({
  children,
  churchId: propChurchId,
  allowedRoles = [],
  requireMembership = false,
  requireAdmin = false,
  fallbackPath = '/',
}) {
  const { isAuthenticated, isInitialized, loading, isSystemAdmin, isChurchAdmin, isChurchMember } =
    useAuth();
  const location = useLocation();
  const params = useParams();

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
    return children;
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
    return children;
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
    return children;
  }

  // Check specific roles (if any specified)
  if (allowedRoles.length > 0) {
    const { user } = useAuth();
    const userRole = user?.churchRoles?.[churchId];
    const hasAllowedRole = allowedRoles.includes(userRole);

    if (!hasAllowedRole) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return children;
}

ChurchGuard.propTypes = {
  children: PropTypes.node.isRequired,
  churchId: PropTypes.string,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  requireMembership: PropTypes.bool,
  requireAdmin: PropTypes.bool,
  fallbackPath: PropTypes.string,
};

export default ChurchGuard;
