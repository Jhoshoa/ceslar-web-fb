/**
 * Sermons Routes
 *
 * API endpoints for sermon management.
 * Mixed authentication - some endpoints public, some require auth.
 */

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';

import * as sermonService from '../services/sermon.service';
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
import { SermonCategory } from '@ceslar/shared-types';

const router = Router();

/**
 * GET /sermons
 * Get all sermons (public with optional auth)
 */
router.get(
  '/',
  optionalAuth,
  [commonValidators.page, commonValidators.limit, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const result = await sermonService.getSermons({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        churchId: req.query.churchId as string,
        category: req.query.category as SermonCategory,
        speakerName: req.query.speakerName as string,
        search: req.query.search as string,
        isPublished: req.query.isPublished === 'false' ? false : true,
      });
      successWithPagination(res, result.data, result.pagination);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * GET /sermons/latest
 * Get latest sermons (public)
 */
router.get('/latest', async (req: Request, res: Response) => {
  try {
    const sermons = await sermonService.getLatestSermons(
      parseInt(req.query.limit as string) || 3,
      req.query.churchId as string
    );
    success(res, sermons);
  } catch (error) {
    serverError(res, (error as Error).message);
  }
});

/**
 * GET /sermons/featured
 * Get featured sermons (public)
 */
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const sermons = await sermonService.getFeaturedSermons(
      parseInt(req.query.limit as string) || 3
    );
    success(res, sermons);
  } catch (error) {
    serverError(res, (error as Error).message);
  }
});

/**
 * GET /sermons/:id
 * Get sermon by ID (public)
 */
router.get(
  '/:id',
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const sermon = await sermonService.getSermonById(req.params.id as string);
      if (!sermon) {
        return notFound(res, 'Sermon');
      }
      success(res, sermon);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * POST /sermons
 * Create sermon (auth required)
 */
router.post(
  '/',
  verifyToken,
  [
    body('title').notEmpty(),
    body('churchId').notEmpty(),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const sermon = await sermonService.createSermon(req.body, req.userId!);
      created(res, sermon);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * PUT /sermons/:id
 * Update sermon (auth required)
 */
router.put(
  '/:id',
  verifyToken,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const sermon = await sermonService.updateSermon(req.params.id as string, req.body);
      success(res, sermon);
    } catch (error) {
      if ((error as Error).message === 'Sermon not found') {
        return notFound(res, 'Sermon');
      }
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * DELETE /sermons/:id
 * Delete sermon (auth required)
 */
router.delete(
  '/:id',
  verifyToken,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      await sermonService.deleteSermon(req.params.id as string);
      noContent(res);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * POST /sermons/:id/views
 * Increment sermon view count (public)
 */
router.post(
  '/:id/views',
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      await sermonService.incrementViews(req.params.id as string);
      success(res, { success: true });
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

export default router;
