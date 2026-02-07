/**
 * Ministries Routes
 *
 * API endpoints for ministry management.
 * Mixed authentication - some endpoints public, some require auth.
 */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';

import * as ministryService from '../services/ministry.service';
import { verifyToken, optionalAuth } from '../middleware/auth.middleware';
import {
  handleValidationErrors,
  commonValidators,
} from '../utils/validation.utils';
import {
  success,
  successWithPagination,
  created,
  noContent,
  notFound,
  serverError,
} from '../utils/response.utils';
import { MinistryType, MinistryScope } from '@ceslar/shared-types';

const router = Router();

/**
 * GET /ministries
 * Get all ministries (public with optional auth)
 */
router.get(
  '/',
  optionalAuth,
  [commonValidators.page, commonValidators.limit, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const result = await ministryService.getMinistries({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        churchId: req.query.churchId as string,
        type: req.query.type as MinistryType,
        scope: req.query.scope as MinistryScope,
        isActive: req.query.isActive === 'true' ? true : undefined,
      });
      successWithPagination(res, result.data, result.pagination);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * GET /ministries/:id
 * Get ministry by ID (public)
 */
router.get(
  '/:id',
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const ministry = await ministryService.getMinistryById(req.params.id as string);
      if (!ministry) {
        return notFound(res, 'Ministry');
      }
      success(res, ministry);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * POST /ministries
 * Create ministry (auth required)
 */
router.post(
  '/',
  verifyToken,
  [
    body('name').notEmpty(),
    body('churchId').notEmpty(),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const ministry = await ministryService.createMinistry(req.body, req.userId!);
      created(res, ministry);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * PUT /ministries/:id
 * Update ministry (auth required)
 */
router.put(
  '/:id',
  verifyToken,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const ministry = await ministryService.updateMinistry(req.params.id as string, req.body);
      success(res, ministry);
    } catch (error) {
      if ((error as Error).message === 'Ministry not found') {
        return notFound(res, 'Ministry');
      }
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * DELETE /ministries/:id
 * Delete ministry (auth required)
 */
router.delete(
  '/:id',
  verifyToken,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      await ministryService.deleteMinistry(req.params.id as string);
      noContent(res);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

export default router;
