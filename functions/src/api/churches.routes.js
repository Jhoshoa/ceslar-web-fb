/**
 * Churches Routes
 *
 * API endpoints for church management.
 * Mixed authentication - some endpoints public, some require auth.
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const churchService = require('../services/church.service');
const { verifyToken, optionalAuth } = require('../middleware/auth.middleware');
const { requireSystemAdmin, requireChurchAdmin } = require('../middleware/permissions.middleware');
const {
  handleValidationErrors,
  commonValidators,
  churchLevelValidator,
} = require('../utils/validation.utils');
const {
  success,
  successWithPagination,
  created,
  noContent,
  notFound,
  serverError,
} = require('../utils/response.utils');

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
  async (req, res) => {
    try {
      const result = await churchService.getChurches({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        country: req.query.country,
        department: req.query.department,
        city: req.query.city,
        level: req.query.level,
        status: req.query.status || 'active',
        search: req.query.search,
      });

      successWithPagination(res, result.data, result.pagination);
    } catch (error) {
      console.error('Error getting churches:', error);
      serverError(res, error.message);
    }
  },
);

/**
 * GET /churches/featured
 * Get featured churches (public)
 */
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const churches = await churchService.getFeaturedChurches(limit);
    success(res, churches);
  } catch (error) {
    console.error('Error getting featured churches:', error);
    serverError(res, error.message);
  }
});

/**
 * GET /churches/headquarters
 * Get headquarters church (public)
 */
router.get('/headquarters', async (req, res) => {
  try {
    const church = await churchService.getHeadquarters();
    if (!church) {
      return notFound(res, 'Headquarters');
    }
    success(res, church);
  } catch (error) {
    console.error('Error getting headquarters:', error);
    serverError(res, error.message);
  }
});

/**
 * GET /churches/grouped
 * Get churches grouped by location (public)
 */
router.get('/grouped', async (req, res) => {
  try {
    const grouped = await churchService.getChurchesGrouped();
    success(res, grouped);
  } catch (error) {
    console.error('Error getting grouped churches:', error);
    serverError(res, error.message);
  }
});

/**
 * GET /churches/countries
 * Get available countries (public)
 */
router.get('/countries', async (req, res) => {
  try {
    const countries = await churchService.getCountries();
    success(res, countries);
  } catch (error) {
    console.error('Error getting countries:', error);
    serverError(res, error.message);
  }
});

/**
 * GET /churches/countries/:country/departments
 * Get departments by country (public)
 */
router.get(
  '/countries/:country/departments',
  [param('country').trim().notEmpty(), handleValidationErrors],
  async (req, res) => {
    try {
      const departments = await churchService.getDepartmentsByCountry(req.params.country);
      success(res, departments);
    } catch (error) {
      console.error('Error getting departments:', error);
      serverError(res, error.message);
    }
  },
);

/**
 * GET /churches/slug/:slug
 * Get church by slug (public)
 */
router.get(
  '/slug/:slug',
  [param('slug').trim().notEmpty(), handleValidationErrors],
  async (req, res) => {
    try {
      const church = await churchService.getChurchBySlug(req.params.slug);
      if (!church) {
        return notFound(res, 'Church');
      }
      success(res, church);
    } catch (error) {
      console.error('Error getting church by slug:', error);
      serverError(res, error.message);
    }
  },
);

/**
 * GET /churches/:id
 * Get church by ID (public)
 */
router.get(
  '/:id',
  [commonValidators.id, handleValidationErrors],
  async (req, res) => {
    try {
      const includeLeadership = req.query.includeLeadership === 'true';
      const church = await churchService.getChurchById(req.params.id, includeLeadership);

      if (!church) {
        return notFound(res, 'Church');
      }

      success(res, church);
    } catch (error) {
      console.error('Error getting church:', error);
      serverError(res, error.message);
    }
  },
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
  async (req, res) => {
    try {
      const church = await churchService.createChurch(req.body);
      created(res, church);
    } catch (error) {
      console.error('Error creating church:', error);
      serverError(res, error.message);
    }
  },
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
  async (req, res) => {
    try {
      // Check permissions
      const { isSystemAdmin, isChurchAdmin } = require('../services/auth.service');
      if (!isSystemAdmin(req.user) && !isChurchAdmin(req.user, req.params.id)) {
        return res.status(403).json({
          success: false,
          error: { code: 'forbidden', message: 'Church admin access required' },
        });
      }

      const church = await churchService.updateChurch(req.params.id, req.body);
      success(res, church);
    } catch (error) {
      console.error('Error updating church:', error);
      if (error.message === 'Church not found') {
        return notFound(res, 'Church');
      }
      serverError(res, error.message);
    }
  },
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
  async (req, res) => {
    try {
      await churchService.deleteChurch(req.params.id);
      noContent(res);
    } catch (error) {
      console.error('Error deleting church:', error);
      serverError(res, error.message);
    }
  },
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
    body('name').trim().notEmpty(),
    body('role').trim().notEmpty(),
    body('title').optional().trim(),
    body('photoURL').optional().isURL(),
    body('bio').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      // Check permissions
      const { isSystemAdmin, isChurchAdmin } = require('../services/auth.service');
      if (!isSystemAdmin(req.user) && !isChurchAdmin(req.user, req.params.id)) {
        return res.status(403).json({
          success: false,
          error: { code: 'forbidden', message: 'Church admin access required' },
        });
      }

      const leadership = await churchService.addLeadership(req.params.id, req.body);
      created(res, leadership);
    } catch (error) {
      console.error('Error adding leadership:', error);
      if (error.message === 'Church not found') {
        return notFound(res, 'Church');
      }
      serverError(res, error.message);
    }
  },
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
  async (req, res) => {
    try {
      // Check permissions
      const { isSystemAdmin, isChurchAdmin } = require('../services/auth.service');
      if (!isSystemAdmin(req.user) && !isChurchAdmin(req.user, req.params.id)) {
        return res.status(403).json({
          success: false,
          error: { code: 'forbidden', message: 'Church admin access required' },
        });
      }

      await churchService.removeLeadership(req.params.id, req.params.leadershipId);
      noContent(res);
    } catch (error) {
      console.error('Error removing leadership:', error);
      serverError(res, error.message);
    }
  },
);

module.exports = router;
