/**
 * Churches Routes
 *
 * API endpoints for church management.
 * Mixed authentication - some endpoints public, some require auth.
 */

import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';

import * as churchService from '../services/church.service';
import { verifyToken } from '../middleware/auth.middleware';
import { requireSystemAdmin } from '../middleware/permissions.middleware';
import { isSystemAdmin, isChurchAdmin } from '../services/auth.service';
import {
  handleValidationErrors,
  commonValidators,
  churchLevelValidator,
} from '../utils/validation.utils';
import {
  success,
  successWithPagination,
  created,
  noContent,
  notFound,
  serverError,
  forbidden,
} from '../utils/response.utils';
import { ChurchLevel, ChurchStatus } from '@ceslar/shared-types';

const router = Router();

/**
 * GET /churches
 * Get all churches (public)
 */
router.get(
  '/',
  [
    commonValidators.page,
    commonValidators.limit,
    commonValidators.search,
    query('country').optional().trim(),
    query('department').optional().trim(),
    query('city').optional().trim(),
    query('level').optional().isIn(['headquarters', 'country', 'department', 'province', 'local']),
    query('status').optional().isIn(['active', 'inactive']),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const result = await churchService.getChurches({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        country: req.query.country as string,
        department: req.query.department as string,
        city: req.query.city as string,
        level: req.query.level as ChurchLevel,
        status: (req.query.status as ChurchStatus) || 'active',
        search: req.query.search as string,
      });

      successWithPagination(res, result.data, result.pagination);
    } catch (error) {
      console.error('Error getting churches:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * GET /churches/featured
 * Get featured churches (public)
 */
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 4;
    const churches = await churchService.getFeaturedChurches(limit);
    success(res, churches);
  } catch (error) {
    console.error('Error getting featured churches:', error);
    serverError(res, (error as Error).message);
  }
});

/**
 * GET /churches/headquarters
 * Get headquarters church (public)
 */
router.get('/headquarters', async (_req: Request, res: Response) => {
  try {
    const church = await churchService.getHeadquarters();
    if (!church) {
      return notFound(res, 'Headquarters');
    }
    success(res, church);
  } catch (error) {
    console.error('Error getting headquarters:', error);
    serverError(res, (error as Error).message);
  }
});

/**
 * GET /churches/grouped
 * Get churches grouped by location (public)
 */
router.get('/grouped', async (_req: Request, res: Response) => {
  try {
    const grouped = await churchService.getChurchesGrouped();
    success(res, grouped);
  } catch (error) {
    console.error('Error getting grouped churches:', error);
    serverError(res, (error as Error).message);
  }
});

/**
 * GET /churches/countries
 * Get available countries (public)
 */
router.get('/countries', async (_req: Request, res: Response) => {
  try {
    const countries = await churchService.getCountries();
    success(res, countries);
  } catch (error) {
    console.error('Error getting countries:', error);
    serverError(res, (error as Error).message);
  }
});

/**
 * GET /churches/countries/:country/departments
 * Get departments by country (public)
 */
router.get(
  '/countries/:country/departments',
  [param('country').trim().notEmpty(), handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const countryParam = Array.isArray(req.params.country) ? req.params.country[0] : req.params.country;
      const departments = await churchService.getDepartmentsByCountry(countryParam);
      success(res, departments);
    } catch (error) {
      console.error('Error getting departments:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * GET /churches/slug/:slug
 * Get church by slug (public)
 */
router.get(
  '/slug/:slug',
  [param('slug').trim().notEmpty(), handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const slugParam = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
      const church = await churchService.getChurchBySlug(slugParam);
      if (!church) {
        return notFound(res, 'Church');
      }
      success(res, church);
    } catch (error) {
      console.error('Error getting church by slug:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * GET /churches/:id
 * Get church by ID (public)
 */
router.get(
  '/:id',
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const includeLeadership = req.query.includeLeadership === 'true';
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const church = await churchService.getChurchById(idParam, includeLeadership);

      if (!church) {
        return notFound(res, 'Church');
      }

      success(res, church);
    } catch (error) {
      console.error('Error getting church:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * POST /churches
 * Create church (admin only)
 */
router.post(
  '/',
  verifyToken,
  requireSystemAdmin,
  [
    body('name').trim().notEmpty().isLength({ min: 2, max: 200 }),
    churchLevelValidator,
    body('parentChurchId').optional().trim(),
    body('country').trim().notEmpty(),
    body('countryCode').optional().trim().isLength({ min: 2, max: 3 }),
    body('department').optional().trim(),
    body('province').optional().trim(),
    body('city').optional().trim(),
    body('address').optional().trim(),
    body('coordinates').optional().isObject(),
    body('phone').optional().trim(),
    body('email').optional().isEmail(),
    body('website').optional().isURL(),
    body('description').optional().isObject(),
    body('serviceSchedule').optional().isArray(),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const church = await churchService.createChurch(req.body);
      created(res, church);
    } catch (error) {
      console.error('Error creating church:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * PUT /churches/:id
 * Update church (church admin or system admin)
 */
router.put(
  '/:id',
  verifyToken,
  [
    commonValidators.id,
    body('name').optional().trim().isLength({ min: 2, max: 200 }),
    churchLevelValidator,
    body('status').optional().isIn(['active', 'inactive']),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      // Check permissions
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!isSystemAdmin(req.user!) && !isChurchAdmin(req.user!, idParam)) {
        return forbidden(res, 'Church admin access required');
      }

      const church = await churchService.updateChurch(idParam, req.body);
      success(res, church);
    } catch (error) {
      console.error('Error updating church:', error);
      if ((error as Error).message === 'Church not found') {
        return notFound(res, 'Church');
      }
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * DELETE /churches/:id
 * Delete church (system admin only)
 */
router.delete(
  '/:id',
  verifyToken,
  requireSystemAdmin,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await churchService.deleteChurch(idParam);
      noContent(res);
    } catch (error) {
      console.error('Error deleting church:', error);
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * POST /churches/:id/leadership
 * Add leadership to church (church admin)
 */
router.post(
  '/:id/leadership',
  verifyToken,
  [
    commonValidators.id,
    body('userId').optional().trim(),
    body('displayName').trim().notEmpty(),
    body('role').trim().notEmpty(),
    body('title').optional().isObject(),
    body('photoURL').optional().isURL(),
    body('bio').optional().isObject(),
    body('order').optional().isInt({ min: 0 }),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      // Check permissions
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!isSystemAdmin(req.user!) && !isChurchAdmin(req.user!, idParam)) {
        return forbidden(res, 'Church admin access required');
      }

      const leadership = await churchService.addLeadership(idParam, req.body);
      created(res, leadership);
    } catch (error) {
      console.error('Error adding leadership:', error);
      if ((error as Error).message === 'Church not found') {
        return notFound(res, 'Church');
      }
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * DELETE /churches/:id/leadership/:leadershipId
 * Remove leadership from church (church admin)
 */
router.delete(
  '/:id/leadership/:leadershipId',
  verifyToken,
  [
    commonValidators.id,
    param('leadershipId').trim().notEmpty(),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      // Check permissions
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!isSystemAdmin(req.user!) && !isChurchAdmin(req.user!, idParam)) {
        return forbidden(res, 'Church admin access required');
      }

      const leadershipIdParam = Array.isArray(req.params.leadershipId) ? req.params.leadershipId[0] : req.params.leadershipId;
      await churchService.removeLeadership(idParam, leadershipIdParam);
      noContent(res);
    } catch (error) {
      console.error('Error removing leadership:', error);
      serverError(res, (error as Error).message);
    }
  }
);

export default router;
