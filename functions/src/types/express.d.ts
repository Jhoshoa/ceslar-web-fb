/**
 * Express Type Extensions
 *
 * Extends Express Request interface with authenticated user context.
 */

import { SystemRole, Permission, ChurchRole } from '@ceslar/shared-types';

/**
 * Authenticated user context attached to request by auth middleware
 */
export interface AuthenticatedUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
  systemRole: SystemRole;
  churchRoles: Record<string, ChurchRole>;
  permissions: Permission[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser | null;
      userId?: string | null;
    }
  }
}

// Re-export Request type for convenience
export type { Request, Response, NextFunction, Router } from 'express';

/**
 * Extended Express Request with optional auth context
 */
export interface AuthenticatedRequest extends Express.Request {
  user?: AuthenticatedUser | null;
  userId?: string | null;
}

/**
 * Request that requires authentication (user is guaranteed to exist)
 */
export interface RequiredAuthRequest extends Express.Request {
  user: AuthenticatedUser;
  userId: string;
}
