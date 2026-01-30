/**
 * Permissions Middleware
 *
 * This middleware handles authorization checks:
 * - System role requirements
 * - Church role requirements
 * - Permission-based access control
 */

import { Request, Response, NextFunction } from 'express';
import {
  isSystemAdmin,
  isChurchAdmin,
  hasChurchRole,
  hasPermission,
} from '../services/auth.service';
import { ChurchRole, Permission, UserClaims } from '@ceslar/shared-types';

/**
 * Require authenticated user
 *
 * Basic middleware to ensure user is logged in
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
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
 */
export function requireSystemAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'auth/not-authenticated',
        message: 'Authentication required.',
      },
    });
  }

  if (!isSystemAdmin(req.user as UserClaims)) {
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
 */
export function requireChurchAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'auth/not-authenticated',
        message: 'Authentication required.',
      },
    });
  }

  const churchId =
    req.params.churchId ||
    (req.body as { churchId?: string })?.churchId ||
    (req.query.churchId as string);

  if (!churchId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'validation/missing-church-id',
        message: 'Church ID is required.',
      },
    });
  }

  if (!isChurchAdmin(req.user as UserClaims, churchId)) {
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
 * @example
 * router.get('/members', verifyToken, requireChurchRole(['admin', 'pastor', 'leader']), getMembers)
 */
export function requireChurchRole(roles: ChurchRole[]) {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/not-authenticated',
          message: 'Authentication required.',
        },
      });
    }

    const churchId =
      req.params.churchId ||
      (req.body as { churchId?: string })?.churchId ||
      (req.query.churchId as string);

    if (!churchId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'validation/missing-church-id',
          message: 'Church ID is required.',
        },
      });
    }

    if (!hasChurchRole(req.user as UserClaims, churchId, roles)) {
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
 * @example
 * router.delete('/users/:id', verifyToken, requirePermission('delete:all'), deleteUser)
 */
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/not-authenticated',
          message: 'Authentication required.',
        },
      });
    }

    if (!hasPermission(req.user as UserClaims, permission)) {
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
 */
export function requireAnyPermission(permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/not-authenticated',
          message: 'Authentication required.',
        },
      });
    }

    const hasAny = permissions.some((perm) =>
      hasPermission(req.user as UserClaims, perm)
    );

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
 */
export function requireOwnerOrAdmin(ownerField: string = 'userId') {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/not-authenticated',
          message: 'Authentication required.',
        },
      });
    }

    const ownerId =
      req.params[ownerField] ||
      (req.body as Record<string, unknown>)?.[ownerField];
    const isOwner = ownerId === req.user.uid;
    const admin = isSystemAdmin(req.user as UserClaims);

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
