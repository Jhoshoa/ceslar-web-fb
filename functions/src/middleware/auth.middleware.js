/**
 * Auth Middleware
 *
 * This middleware handles:
 * - Firebase ID token verification
 * - Extracting user claims from the token
 * - Attaching user info to the request object
 */

const { auth } = require('../config/firebase');

/**
 * Verify Firebase ID token from Authorization header
 *
 * Expects: Authorization: Bearer <token>
 *
 * On success, attaches to req:
 * - req.user: Firebase decoded token with custom claims
 * - req.userId: The user's Firebase UID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function verifyToken(req, res, next) {
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
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
      systemRole: decodedToken.systemRole || 'user',
      churchRoles: decodedToken.churchRoles || {},
      permissions: decodedToken.permissions || ['read:public'],
    };
    req.userId = decodedToken.uid;

    next();
  } catch (error) {
    console.error('Token verification failed:', error.code, error.message);

    // Handle specific error types
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/token-expired',
          message: 'Authentication token has expired. Please refresh your token.',
        },
      });
    }

    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/token-revoked',
          message: 'Authentication token has been revoked. Please sign in again.',
        },
      });
    }

    if (error.code === 'auth/argument-error') {
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
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function optionalAuth(req, res, next) {
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
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
      systemRole: decodedToken.systemRole || 'user',
      churchRoles: decodedToken.churchRoles || {},
      permissions: decodedToken.permissions || ['read:public'],
    };
    req.userId = decodedToken.uid;
  } catch (error) {
    // Token invalid - continue as anonymous
    console.warn('Optional auth token invalid:', error.code);
    req.user = null;
    req.userId = null;
  }

  next();
}

/**
 * Require email verification
 *
 * Must be used after verifyToken middleware
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requireEmailVerified(req, res, next) {
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

module.exports = {
  verifyToken,
  optionalAuth,
  requireEmailVerified,
};
