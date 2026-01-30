/**
 * Events Routes
 *
 * API endpoints for event management.
 * Mixed authentication - some endpoints public, some require auth.
 */

import { Router, Request, Response } from 'express';
import { body, query } from 'express-validator';

import * as eventService from '../services/event.service';
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
import { EventType, EventStatus } from '@ceslar/shared-types';

const router = Router();

/**
 * GET /events
 * Get all events (public with optional auth)
 */
router.get(
  '/',
  optionalAuth,
  [
    commonValidators.page,
    commonValidators.limit,
    query('churchId').optional().trim(),
    query('type').optional().trim(),
    query('status').optional().trim(),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const result = await eventService.getEvents({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        churchId: req.query.churchId as string,
        type: req.query.type as EventType,
        status: req.query.status as EventStatus,
        isPublic: !req.user ? true : undefined,
      });
      successWithPagination(res, result.data, result.pagination);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * GET /events/upcoming
 * Get upcoming events (public)
 */
router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 3;
    const events = await eventService.getUpcomingEvents(
      limit,
      req.query.churchId as string
    );
    success(res, events);
  } catch (error) {
    serverError(res, (error as Error).message);
  }
});

/**
 * GET /events/:id
 * Get event by ID (public with optional auth)
 */
router.get(
  '/:id',
  optionalAuth,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const event = await eventService.getEventById(req.params.id);
      if (!event) {
        return notFound(res, 'Event');
      }
      success(res, event);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * POST /events
 * Create event (auth required)
 */
router.post(
  '/',
  verifyToken,
  [
    body('title').notEmpty(),
    body('churchId').notEmpty(),
    body('startDate').isISO8601(),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const event = await eventService.createEvent(req.body, req.userId!);
      created(res, event);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * PUT /events/:id
 * Update event (auth required)
 */
router.put(
  '/:id',
  verifyToken,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const event = await eventService.updateEvent(req.params.id, req.body);
      success(res, event);
    } catch (error) {
      if ((error as Error).message === 'Event not found') {
        return notFound(res, 'Event');
      }
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * DELETE /events/:id
 * Delete event (auth required)
 */
router.delete(
  '/:id',
  verifyToken,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      await eventService.deleteEvent(req.params.id);
      noContent(res);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * POST /events/:id/register
 * Register for event (auth required)
 */
router.post(
  '/:id/register',
  verifyToken,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      await eventService.registerForEvent(req.params.id, req.userId!, req.body);
      success(res, { message: 'Successfully registered' });
    } catch (error) {
      if ((error as Error).message === 'Event not found') {
        return notFound(res, 'Event');
      }
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * DELETE /events/:id/register
 * Cancel event registration (auth required)
 */
router.delete(
  '/:id/register',
  verifyToken,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      await eventService.cancelRegistration(req.params.id, req.userId!);
      noContent(res);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

export default router;
