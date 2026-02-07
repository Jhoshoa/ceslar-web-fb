/**
 * Auth Middleware
 *
 * This middleware handles:
 * - Firebase ID token verification
 * - Extracting user claims from the token
 * - Attaching user info to the request object
 */

import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { UserClaims, SystemRole, ChurchRole, Permission } from '@ceslar/shared-types';

/**
 * Authenticated user attached to request
 */
export interface AuthenticatedUser extends UserClaims {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser | null;
      userId?: string | null;
    }
  }
}

/**
 * Verify Firebase ID token from Authorization header
 *
 * Expects: Authorization: Bearer <token>
 *
 * On success, attaches to req:
 * - req.user: Firebase decoded token with custom claims
 * - req.userId: The user's Firebase UID
 */
export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'auth/no-token',
        message: 'No authentication token provided',
      },
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Verify the token
    const decodedToken = await auth.verifyIdToken(idToken);

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      emailVerified: decodedToken.email_verified || false,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
      systemRole: (decodedToken.systemRole as SystemRole) || 'user',
      churchRoles: (decodedToken.churchRoles as Record<string, ChurchRole>) || {},
      permissions: (decodedToken.permissions as Permission[]) || ['read:public'],
    };
    req.userId = decodedToken.uid;

    next();
  } catch (error) {
    const err = error as { code?: string; message?: string };
    console.error('Token verification failed:', err.code, err.message);

    // Handle specific error types
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/token-expired',
          message: 'Authentication token has expired. Please refresh your token.',
        },
      });
    }

    if (err.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/token-revoked',
          message: 'Authentication token has been revoked. Please sign in again.',
        },
      });
    }

    if (err.code === 'auth/argument-error') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/invalid-token',
          message: 'Invalid authentication token format.',
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'auth/invalid-token',
        message: 'Authentication token is invalid.',
      },
    });
  }
}

/**
 * Optional auth - verifies token if present but doesn't require it
 *
 * Use for endpoints that work differently for authenticated vs anonymous users
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token - continue as anonymous
    req.user = null;
    req.userId = null;
    return next();
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      emailVerified: decodedToken.email_verified || false,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
      systemRole: (decodedToken.systemRole as SystemRole) || 'user',
      churchRoles: (decodedToken.churchRoles as Record<string, ChurchRole>) || {},
      permissions: (decodedToken.permissions as Permission[]) || ['read:public'],
    };
    req.userId = decodedToken.uid;
  } catch (error) {
    const err = error as { code?: string };
    // Token invalid - continue as anonymous
    console.warn('Optional auth token invalid:', err.code);
    req.user = null;
    req.userId = null;
  }

  next();
}

/**
 * Require email verification
 *
 * Must be used after verifyToken middleware
 */
export function requireEmailVerified(
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

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'auth/email-not-verified',
        message: 'Please verify your email address to access this resource.',
      },
    });
  }

  next();
}
