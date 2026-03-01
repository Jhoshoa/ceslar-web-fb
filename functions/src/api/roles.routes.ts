/**
 * Roles Routes
 *
 * API endpoints for role management.
 * System roles require system_admin.
 * Church roles can be managed by church admins for their church.
 */

import { Router, Request, Response } from 'express';
import { body, query } from 'express-validator';

import * as roleService from '../services/role.service';
import { isSystemAdmin, isChurchAdmin } from '../services/auth.service';
import { requireSystemAdmin, requireAuth } from '../middleware/permissions.middleware';
import {
  handleValidationErrors,
  commonValidators,
} from '../utils/validation.utils';
import {
  success,
  created,
  noContent,
  notFound,
  badRequest,
  forbidden,
  serverError,
} from '../utils/response.utils';
import { UserClaims } from '@ceslar/shared-types';

const router = Router();

/**
 * GET /roles
 * Get all roles with optional filtering
 *
 * System admin: Can see all roles
 * Church admin: Can only see church roles for their church + default church roles
 */
router.get(
  '/',
  requireAuth,
  [
    query('scope')
      .optional()
      .isIn(['system', 'church'])
      .withMessage('Scope must be system or church'),
    query('churchId')
      .optional()
      .isString()
      .withMessage('Church ID must be a string'),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const { scope, churchId } = req.query;
      const userClaims = req.user as UserClaims;

      // Only system admin can view system roles
      if (scope === 'system' && !isSystemAdmin(userClaims)) {
        return forbidden(res, 'Only system administrators can view system roles');
      }

      // Build filters
      const filters: roleService.RoleFilters = {};

      if (scope) {
        filters.scope = scope as 'system' | 'church';
      }

      // For church roles, restrict to user's churches unless system admin
      if (churchId) {
        if (!isSystemAdmin(userClaims) && !isChurchAdmin(userClaims, churchId as string)) {
          return forbidden(res, 'You can only view roles for churches you manage');
        }
        filters.churchId = churchId as string;
      }

      const roles = await roleService.getRoles(filters);

      // If not system admin and viewing church roles, filter to only default roles
      // and roles for churches they manage
      let filteredRoles = roles;
      if (!isSystemAdmin(userClaims)) {
        filteredRoles = roles.filter((role) => {
          if (role.scope === 'system') return false;
          if (role.isDefault) return true;
          if (role.churchId && isChurchAdmin(userClaims, role.churchId)) return true;
          return false;
        });
      }

      success(res, filteredRoles);
    } catch (error) {
      console.error('Error getting roles:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * GET /roles/defaults
 * Get default roles (system and church)
 *
 * Available to system admins
 */
router.get(
  '/defaults',
  requireSystemAdmin,
  async (_req: Request, res: Response) => {
    try {
      const [systemRoles, churchRoles] = await Promise.all([
        roleService.getDefaultSystemRoles(),
        roleService.getDefaultChurchRoles(),
      ]);

      success(res, {
        system: systemRoles,
        church: churchRoles,
      });
    } catch (error) {
      console.error('Error getting default roles:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * GET /roles/:id
 * Get role by ID
 */
router.get(
  '/:id',
  requireAuth,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const role = await roleService.getRoleById(req.params.id);

      if (!role) {
        return notFound(res, 'Role');
      }

      const userClaims = req.user as UserClaims;

      // Check access
      if (role.scope === 'system' && !isSystemAdmin(userClaims)) {
        return forbidden(res, 'Only system administrators can view system roles');
      }

      if (
        role.scope === 'church' &&
        role.churchId &&
        !isSystemAdmin(userClaims) &&
        !isChurchAdmin(userClaims, role.churchId)
      ) {
        return forbidden(res, 'You can only view roles for churches you manage');
      }

      success(res, role);
    } catch (error) {
      console.error('Error getting role:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * POST /roles
 * Create a new role
 *
 * System admin: Can create any role
 * Church admin: Can only create church roles for their church
 */
router.post(
  '/',
  requireAuth,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be at most 500 characters'),
    body('scope')
      .isIn(['system', 'church'])
      .withMessage('Scope must be system or church'),
    body('churchId')
      .optional()
      .isString()
      .withMessage('Church ID must be a string'),
    body('permissions')
      .isArray({ min: 1 })
      .withMessage('At least one permission is required'),
    body('permissions.*')
      .isString()
      .withMessage('Permission IDs must be strings'),
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Color must be a valid hex color'),
    body('icon')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Icon must be at most 50 characters'),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const { name, description, scope, churchId, permissions, color, icon } = req.body;
      const userClaims = req.user as UserClaims;

      // Check authorization
      if (scope === 'system' && !isSystemAdmin(userClaims)) {
        return forbidden(res, 'Only system administrators can create system roles');
      }

      if (scope === 'church') {
        if (!churchId) {
          return badRequest(res, 'Church ID is required for church-scoped roles');
        }

        if (!isSystemAdmin(userClaims) && !isChurchAdmin(userClaims, churchId)) {
          return forbidden(res, 'You can only create roles for churches you manage');
        }
      }

      const role = await roleService.createRole({
        name,
        description,
        scope,
        churchId,
        permissions,
        color,
        icon,
        createdBy: req.userId!,
      });

      created(res, role);
    } catch (error) {
      console.error('Error creating role:', error);
      if ((error as Error).message.includes('already exists')) {
        return badRequest(res, (error as Error).message);
      }
      if ((error as Error).message.includes('Invalid permission')) {
        return badRequest(res, (error as Error).message);
      }
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * PUT /roles/:id
 * Update a role
 */
router.put(
  '/:id',
  requireAuth,
  [
    commonValidators.id,
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be at most 500 characters'),
    body('permissions')
      .optional()
      .isArray({ min: 1 })
      .withMessage('At least one permission is required'),
    body('permissions.*')
      .optional()
      .isString()
      .withMessage('Permission IDs must be strings'),
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Color must be a valid hex color'),
    body('icon')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Icon must be at most 50 characters'),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const roleId = req.params.id;
      const userClaims = req.user as UserClaims;

      // Get existing role
      const existingRole = await roleService.getRoleById(roleId);
      if (!existingRole) {
        return notFound(res, 'Role');
      }

      // Check authorization
      if (existingRole.scope === 'system' && !isSystemAdmin(userClaims)) {
        return forbidden(res, 'Only system administrators can update system roles');
      }

      if (
        existingRole.scope === 'church' &&
        existingRole.churchId &&
        !isSystemAdmin(userClaims) &&
        !isChurchAdmin(userClaims, existingRole.churchId)
      ) {
        return forbidden(res, 'You can only update roles for churches you manage');
      }

      const { name, description, permissions, color, icon } = req.body;

      const role = await roleService.updateRole(roleId, {
        name,
        description,
        permissions,
        color,
        icon,
      });

      success(res, role);
    } catch (error) {
      console.error('Error updating role:', error);
      if ((error as Error).message.includes('cannot be modified')) {
        return forbidden(res, (error as Error).message);
      }
      if ((error as Error).message.includes('Invalid permission')) {
        return badRequest(res, (error as Error).message);
      }
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * DELETE /roles/:id
 * Delete a role
 */
router.delete(
  '/:id',
  requireAuth,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const roleId = req.params.id;
      const userClaims = req.user as UserClaims;

      // Get existing role
      const existingRole = await roleService.getRoleById(roleId);
      if (!existingRole) {
        return notFound(res, 'Role');
      }

      // Check authorization
      if (existingRole.scope === 'system' && !isSystemAdmin(userClaims)) {
        return forbidden(res, 'Only system administrators can delete system roles');
      }

      if (
        existingRole.scope === 'church' &&
        existingRole.churchId &&
        !isSystemAdmin(userClaims) &&
        !isChurchAdmin(userClaims, existingRole.churchId)
      ) {
        return forbidden(res, 'You can only delete roles for churches you manage');
      }

      await roleService.deleteRole(roleId);

      noContent(res);
    } catch (error) {
      console.error('Error deleting role:', error);
      if (
        (error as Error).message.includes('cannot be deleted') ||
        (error as Error).message.includes('assigned to users')
      ) {
        return forbidden(res, (error as Error).message);
      }
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * POST /roles/:id/duplicate
 * Duplicate a role
 */
router.post(
  '/:id/duplicate',
  requireAuth,
  [
    commonValidators.id,
    body('newName')
      .trim()
      .notEmpty()
      .withMessage('New name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('churchId')
      .optional()
      .isString()
      .withMessage('Church ID must be a string'),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const roleId = req.params.id;
      const { newName, churchId } = req.body;
      const userClaims = req.user as UserClaims;

      // Get existing role
      const existingRole = await roleService.getRoleById(roleId);
      if (!existingRole) {
        return notFound(res, 'Role');
      }

      // Determine target scope and check authorization
      const targetScope = churchId ? 'church' : existingRole.scope;

      if (targetScope === 'system' && !isSystemAdmin(userClaims)) {
        return forbidden(res, 'Only system administrators can create system roles');
      }

      if (targetScope === 'church' && churchId) {
        if (!isSystemAdmin(userClaims) && !isChurchAdmin(userClaims, churchId)) {
          return forbidden(res, 'You can only create roles for churches you manage');
        }
      }

      const role = await roleService.duplicateRole(
        roleId,
        newName,
        req.userId!,
        churchId
      );

      created(res, role);
    } catch (error) {
      console.error('Error duplicating role:', error);
      if ((error as Error).message.includes('already exists')) {
        return badRequest(res, (error as Error).message);
      }
      serverError(res, (error as Error).message);
    }
  }
);

export default router;
