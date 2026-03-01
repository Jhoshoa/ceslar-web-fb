/**
 * Permissions Routes
 *
 * API endpoints for permission management.
 * All routes require system_admin role.
 */

import { Router, Request, Response } from 'express';
import { query } from 'express-validator';

import * as permissionService from '../services/permission.service';
import { requireSystemAdmin } from '../middleware/permissions.middleware';
import { handleValidationErrors } from '../utils/validation.utils';
import {
  success,
  notFound,
  serverError,
} from '../utils/response.utils';

const router = Router();

/**
 * GET /permissions
 * Get all permissions
 *
 * Only system_admin can view permissions
 */
router.get(
  '/',
  requireSystemAdmin,
  [
    query('scope')
      .optional()
      .isIn(['system', 'church', 'both'])
      .withMessage('Scope must be system, church, or both'),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const { scope } = req.query;

      let permissions;
      if (scope) {
        permissions = await permissionService.getPermissionsByScope(
          scope as 'system' | 'church' | 'both'
        );
      } else {
        permissions = await permissionService.getAllPermissions();
      }

      success(res, permissions);
    } catch (error) {
      console.error('Error getting permissions:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * GET /permissions/categories
 * Get permissions grouped by category
 *
 * Only system_admin can view permissions
 */
router.get(
  '/categories',
  requireSystemAdmin,
  async (_req: Request, res: Response) => {
    try {
      const categories = await permissionService.getPermissionsByCategory();
      success(res, categories);
    } catch (error) {
      console.error('Error getting permission categories:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * GET /permissions/:id
 * Get permission by ID
 *
 * Only system_admin can view permissions
 */
router.get(
  '/:id',
  requireSystemAdmin,
  async (req: Request, res: Response) => {
    try {
      const permission = await permissionService.getPermissionById(req.params.id);

      if (!permission) {
        return notFound(res, 'Permission');
      }

      success(res, permission);
    } catch (error) {
      console.error('Error getting permission:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * GET /permissions/resource/:resource
 * Get permissions for a specific resource
 *
 * Only system_admin can view permissions
 */
router.get(
  '/resource/:resource',
  requireSystemAdmin,
  async (req: Request, res: Response) => {
    try {
      const permissions = await permissionService.getPermissionsByResource(
        req.params.resource
      );
      success(res, permissions);
    } catch (error) {
      console.error('Error getting permissions by resource:', error);
      serverError(res, (error as Error).message);
    }
  }
);

export default router;
