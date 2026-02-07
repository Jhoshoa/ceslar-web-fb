/**
 * Users Routes
 *
 * API endpoints for user management.
 * All routes require authentication (via middleware in index.js).
 */

import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';

import * as userService from '../services/user.service';
import { isSystemAdmin, isChurchAdmin } from '../services/auth.service';
import { requireSystemAdmin, requireOwnerOrAdmin } from '../middleware/permissions.middleware';
import {
  handleValidationErrors,
  commonValidators,
} from '../utils/validation.utils';
import {
  success,
  successWithPagination,
  notFound,
  badRequest,
  forbidden,
  serverError,
} from '../utils/response.utils';
import {
  uploadImage,
  deleteImage,
  getPublicIdFromUrl,
} from '../config/cloudinary';
import { SystemRole, ChurchRole } from '@ceslar/shared-types';

const router = Router();

/**
 * GET /users/me
 * Get current user profile
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.userId!);

    if (!user) {
      return notFound(res, 'User');
    }

    success(res, user);
  } catch (error) {
    console.error('Error getting current user:', error);
    serverError(res, (error as Error).message);
  }
});

/**
 * PUT /users/me
 * Update current user profile
 */
router.put(
  '/me',
  [
    body('displayName').optional().trim().isLength({ max: 100 }),
    body('firstName').optional().trim().isLength({ max: 50 }),
    body('lastName').optional().trim().isLength({ max: 50 }),
    body('phoneNumber')
      .optional()
      .trim()
      .matches(/^\+?[\d\s-()]+$/),
    body('preferences').optional().isObject(),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const user = await userService.updateUser(req.userId!, req.body);
      success(res, user);
    } catch (error) {
      console.error('Error updating user:', error);
      if ((error as Error).message === 'User not found') {
        return notFound(res, 'User');
      }
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * GET /users
 * Get all users (admin only)
 */
router.get(
  '/',
  requireSystemAdmin,
  [
    commonValidators.page,
    commonValidators.limit,
    commonValidators.search,
    query('systemRole').optional().isIn(['system_admin', 'user']),
    query('churchId').optional().isString(),
    query('isActive').optional().isBoolean(),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const { page, limit, search, systemRole, churchId, isActive } = req.query;

      const result = await userService.getUsers({
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10,
        search: search as string,
        systemRole: systemRole as SystemRole,
        churchId: churchId as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      });

      successWithPagination(res, result.data, result.pagination);
    } catch (error) {
      console.error('Error getting users:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * GET /users/:id
 * Get user by ID (admin only)
 */
router.get(
  '/:id',
  requireSystemAdmin,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const user = await userService.getUserById(req.params.id as string);

      if (!user) {
        return notFound(res, 'User');
      }

      success(res, user);
    } catch (error) {
      console.error('Error getting user:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * PUT /users/:id
 * Update user (admin or self)
 */
router.put(
  '/:id',
  requireOwnerOrAdmin('id'),
  [
    commonValidators.id,
    body('displayName').optional().trim().isLength({ max: 100 }),
    body('firstName').optional().trim().isLength({ max: 50 }),
    body('lastName').optional().trim().isLength({ max: 50 }),
    body('phoneNumber')
      .optional()
      .trim()
      .matches(/^\+?[\d\s-()]+$/),
    body('preferences').optional().isObject(),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const user = await userService.updateUser(req.params.id as string, req.body);
      success(res, user);
    } catch (error) {
      console.error('Error updating user:', error);
      if ((error as Error).message === 'User not found') {
        return notFound(res, 'User');
      }
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * PUT /users/:id/role
 * Update user role (admin only)
 */
router.put(
  '/:id/role',
  requireSystemAdmin,
  [
    commonValidators.id,
    body('systemRole').isIn(['system_admin', 'user']).withMessage('Invalid system role'),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const { systemRole } = req.body;
      const user = await userService.updateUserRole(req.params.id as string, systemRole as SystemRole);
      success(res, user);
    } catch (error) {
      console.error('Error updating user role:', error);
      if ((error as Error).message === 'User not found') {
        return notFound(res, 'User');
      }
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * POST /users/sync
 * Sync user from Firebase Auth (called on login)
 */
router.post(
  '/sync',
  [
    body('uid').notEmpty().withMessage('UID is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const user = await userService.syncUser(req.body);
      success(res, user);
    } catch (error) {
      console.error('Error syncing user:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * PUT /users/:id/deactivate
 * Deactivate user (admin only)
 */
router.put(
  '/:id/deactivate',
  requireSystemAdmin,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      await userService.deactivateUser(req.params.id as string);
      success(res, { message: 'User deactivated successfully' });
    } catch (error) {
      console.error('Error deactivating user:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * PUT /users/:id/reactivate
 * Reactivate user (admin only)
 */
router.put(
  '/:id/reactivate',
  requireSystemAdmin,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      await userService.reactivateUser(req.params.id as string);
      success(res, { message: 'User reactivated successfully' });
    } catch (error) {
      console.error('Error reactivating user:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * POST /users/:id/church-roles
 * Assign a church role to a user (admin or church admin)
 */
router.post(
  '/:id/church-roles',
  [
    commonValidators.id,
    body('churchId').notEmpty().withMessage('Church ID is required'),
    body('role')
      .isIn(['admin', 'pastor', 'leader', 'staff', 'member', 'visitor'])
      .withMessage('Invalid church role'),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const { churchId, role } = req.body;
      const targetUserId = req.params.id as string;

      // Check permissions: must be system admin or church admin for the specified church
      if (!isSystemAdmin(req.user!) && !isChurchAdmin(req.user!, churchId)) {
        return forbidden(res, 'You must be a system admin or church admin to assign roles.');
      }

      const result = await userService.assignChurchRole(targetUserId, churchId, role as ChurchRole);
      success(res, result);
    } catch (error) {
      console.error('Error assigning church role:', error);
      const message = (error as Error).message;
      if (message === 'User not found') {
        return notFound(res, 'User');
      }
      if (message === 'Church not found') {
        return notFound(res, 'Church');
      }
      serverError(res, message);
    }
  }
);

/**
 * PUT /users/:id/church-roles/:churchId
 * Update a user's role for a specific church
 */
router.put(
  '/:id/church-roles/:churchId',
  [
    commonValidators.id,
    param('churchId').notEmpty().withMessage('Church ID is required'),
    body('role')
      .isIn(['admin', 'pastor', 'leader', 'staff', 'member', 'visitor'])
      .withMessage('Invalid church role'),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const { role } = req.body;
      const targetUserId = req.params.id as string;
      const churchId = req.params.churchId as string;

      // Check permissions: must be system admin or church admin for the specified church
      if (!isSystemAdmin(req.user!) && !isChurchAdmin(req.user!, churchId)) {
        return forbidden(res, 'You must be a system admin or church admin to update roles.');
      }

      const result = await userService.assignChurchRole(targetUserId, churchId, role as ChurchRole);
      success(res, result);
    } catch (error) {
      console.error('Error updating church role:', error);
      if ((error as Error).message === 'User not found') {
        return notFound(res, 'User');
      }
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * DELETE /users/:id/church-roles/:churchId
 * Remove a user's role from a specific church
 */
router.delete(
  '/:id/church-roles/:churchId',
  [
    commonValidators.id,
    param('churchId').notEmpty().withMessage('Church ID is required'),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const targetUserId = req.params.id as string;
      const churchId = req.params.churchId as string;

      // Check permissions: must be system admin or church admin for the specified church
      if (!isSystemAdmin(req.user!) && !isChurchAdmin(req.user!, churchId)) {
        return forbidden(res, 'You must be a system admin or church admin to remove roles.');
      }

      await userService.removeChurchRole(targetUserId, churchId);
      success(res, { message: 'Church role removed successfully' });
    } catch (error) {
      console.error('Error removing church role:', error);
      if ((error as Error).message === 'User not found') {
        return notFound(res, 'User');
      }
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * POST /users/:id/avatar
 * Upload profile picture (owner or admin)
 */
router.post(
  '/:id/avatar',
  requireOwnerOrAdmin('id'),
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const { image } = req.body;

      if (!image) {
        return badRequest(res, 'Image data is required');
      }

      // Get current user to check for existing avatar
      const currentUser = await userService.getUserById(req.params.id as string);
      if (!currentUser) {
        return notFound(res, 'User');
      }

      // Delete old avatar if exists
      if (currentUser.photoURL) {
        const oldPublicId = getPublicIdFromUrl(currentUser.photoURL);
        if (oldPublicId) {
          try {
            await deleteImage(oldPublicId);
          } catch {
            // Ignore deletion errors
          }
        }
      }

      // Upload new avatar to Cloudinary
      const uploadResult = await uploadImage(image, {
        folder: 'ceslar/avatars',
        width: 400,
        height: 400,
        publicId: `user-${req.params.id as string}`,
      });

      // Update user profile with new photo URL
      const updatedUser = await userService.updateUser(req.params.id as string, {
        photoURL: uploadResult.url,
      });

      success(res, {
        photoURL: uploadResult.url,
        user: updatedUser,
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * DELETE /users/:id/avatar
 * Remove profile picture (owner or admin)
 */
router.delete(
  '/:id/avatar',
  requireOwnerOrAdmin('id'),
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const currentUser = await userService.getUserById(req.params.id as string);
      if (!currentUser) {
        return notFound(res, 'User');
      }

      // Delete avatar from Cloudinary if exists
      if (currentUser.photoURL) {
        const publicId = getPublicIdFromUrl(currentUser.photoURL);
        if (publicId) {
          try {
            await deleteImage(publicId);
          } catch {
            // Ignore deletion errors
          }
        }
      }

      // Update user profile to remove photo URL
      await userService.updateUser(req.params.id as string, {
        photoURL: null,
      });

      success(res, { message: 'Avatar removed successfully' });
    } catch (error) {
      console.error('Error removing avatar:', error);
      serverError(res, (error as Error).message);
    }
  }
);

export default router;
