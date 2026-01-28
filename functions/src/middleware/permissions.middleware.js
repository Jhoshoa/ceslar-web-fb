/**
 * Permissions Middleware
 *
 * This middleware handles authorization checks:
 * - System role requirements
 * - Church role requirements
 * - Permission-based access control
 */

const {
  isSystemAdmin,
  isChurchAdmin,
  hasChurchRole,
  hasPermission,
} = require('../services/auth.service');

/**
 * Require authenticated user
 *
 * Basic middleware to ensure user is logged in
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'auth/not-authenticated',
        message: 'Authentication required.',
      },
    });
  }
  next();
}

/**
 * Require system administrator role
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requireSystemAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'auth/not-authenticated',
        message: 'Authentication required.',
      },
    });
  }

  if (!isSystemAdmin(req.user)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'auth/insufficient-permissions',
        message: 'System administrator access required.',
      },
    });
  }

  next();
}

/**
 * Require church admin role for a specific church
 *
 * Church ID can be provided in:
 * - req.params.churchId
 * - req.body.churchId
 * - req.query.churchId
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requireChurchAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'auth/not-authenticated',
        message: 'Authentication required.',
      },
    });
  }

  const churchId = req.params.churchId || req.body.churchId || req.query.churchId;

  if (!churchId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'validation/missing-church-id',
        message: 'Church ID is required.',
      },
    });
  }

  if (!isChurchAdmin(req.user, churchId)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'auth/insufficient-permissions',
        message: 'Church administrator access required.',
      },
    });
  }

  next();
}

/**
 * Factory: Require specific church roles
 *
 * @param {string[]} roles - Array of acceptable roles
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/members', verifyToken, requireChurchRole(['admin', 'pastor', 'leader']), getMembers)
 */
function requireChurchRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/not-authenticated',
          message: 'Authentication required.',
        },
      });
    }

    const churchId = req.params.churchId || req.body.churchId || req.query.churchId;

    if (!churchId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'validation/missing-church-id',
          message: 'Church ID is required.',
        },
      });
    }

    if (!hasChurchRole(req.user, churchId, roles)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'auth/insufficient-permissions',
          message: `One of these roles required: ${roles.join(', ')}`,
        },
      });
    }

    next();
  };
}

/**
 * Factory: Require specific permission
 *
 * @param {string} permission - The required permission
 * @returns {Function} Express middleware
 *
 * @example
 * router.delete('/users/:id', verifyToken, requirePermission('delete:all'), deleteUser)
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/not-authenticated',
          message: 'Authentication required.',
        },
      });
    }

    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'auth/insufficient-permissions',
          message: `Permission required: ${permission}`,
        },
      });
    }

    next();
  };
}

/**
 * Factory: Require any of the specified permissions
 *
 * @param {string[]} permissions - Array of permissions (any one is sufficient)
 * @returns {Function} Express middleware
 */
function requireAnyPermission(permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/not-authenticated',
          message: 'Authentication required.',
        },
      });
    }

    const hasAny = permissions.some((perm) => hasPermission(req.user, perm));

    if (!hasAny) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'auth/insufficient-permissions',
          message: `One of these permissions required: ${permissions.join(', ')}`,
        },
      });
    }

    next();
  };
}

/**
 * Check if user owns the resource or is admin
 *
 * Compares req.user.uid with the specified field in params/body
 *
 * @param {string} ownerField - The field name containing the owner ID (default: 'userId')
 * @returns {Function} Express middleware
 */
function requireOwnerOrAdmin(ownerField = 'userId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/not-authenticated',
          message: 'Authentication required.',
        },
      });
    }

    const ownerId = req.params[ownerField] || req.body[ownerField];
    const isOwner = ownerId === req.user.uid;
    const admin = isSystemAdmin(req.user);

    if (!isOwner && !admin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'auth/not-owner',
          message: 'You can only access your own resources.',
        },
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireSystemAdmin,
  requireChurchAdmin,
  requireChurchRole,
  requirePermission,
  requireAnyPermission,
  requireOwnerOrAdmin,
};
