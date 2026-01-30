/**
 * Express Type Extensions
 *
 * Extends Express Request interface with authenticated user context.
 */

import { Request } from 'express';
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

/**
 * Extended Express Request with optional auth context
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser | null;
  userId?: string | null;
}

/**
 * Request that requires authentication (user is guaranteed to exist)
 */
export interface RequiredAuthRequest extends Request {
  user: AuthenticatedUser;
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser | null;
      userId?: string | null;
    }
  }
}
