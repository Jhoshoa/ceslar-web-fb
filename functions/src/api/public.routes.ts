/**
 * Public Routes
 *
 * Unauthenticated endpoints for public-facing content.
 * These provide read-only access to published content.
 */

import { Router, Request, Response } from 'express';
import { query } from 'express-validator';

import * as churchService from '../services/church.service';
import * as eventService from '../services/event.service';
import * as sermonService from '../services/sermon.service';
import * as ministryService from '../services/ministry.service';
import * as questionService from '../services/question.service';
import { handleValidationErrors, commonValidators } from '../utils/validation.utils';
import { success, successWithPagination, notFound, serverError } from '../utils/response.utils';
import { ChurchLevel, EventType, SermonCategory } from '@ceslar/shared-types';

const router = Router();

// ==========================================
// PUBLIC CHURCHES
// ==========================================

// GET /public/churches - Public church listing
router.get(
  '/churches',
  [
    commonValidators.page,
    commonValidators.limit,
    query('country').optional().trim(),
    query('level').optional().isIn(['headquarters', 'country', 'department', 'province', 'local']),
    query('search').optional().trim(),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const result = await churchService.getChurches({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        country: req.query.country as string,
        level: req.query.level as ChurchLevel,
        search: req.query.search as string,
        status: 'active',
      });
      successWithPagination(res, result.data, result.pagination);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

// GET /public/churches/featured - Featured churches
router.get('/churches/featured', async (req: Request, res: Response) => {
  try {
    const churches = await churchService.getFeaturedChurches(
      parseInt(req.query.limit as string) || 4
    );
    success(res, churches);
  } catch (error) {
    serverError(res, (error as Error).message);
  }
});

// GET /public/churches/countries - Available countries
router.get('/churches/countries', async (_req: Request, res: Response) => {
  try {
    const countries = await churchService.getCountries();
    success(res, countries);
  } catch (error) {
    serverError(res, (error as Error).message);
  }
});

// GET /public/churches/:id - Church detail
router.get(
  '/churches/:id',
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const church = await churchService.getChurchById(req.params.id as string, true);
      if (!church || church.status !== 'active') return notFound(res, 'Church');
      success(res, church);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

// ==========================================
// PUBLIC EVENTS
// ==========================================

// GET /public/events - Public events listing
router.get(
  '/events',
  [
    commonValidators.page,
    commonValidators.limit,
    query('churchId').optional().trim(),
    query('type').optional().trim(),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const result = await eventService.getEvents({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        churchId: req.query.churchId as string,
        type: req.query.type as EventType,
        isPublic: true,
        status: 'published',
      });
      successWithPagination(res, result.data, result.pagination);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

// GET /public/events/upcoming - Upcoming public events
router.get('/events/upcoming', async (req: Request, res: Response) => {
  try {
    const events = await eventService.getUpcomingEvents(
      parseInt(req.query.limit as string) || 5,
      req.query.churchId as string | null
    );
    success(res, events);
  } catch (error) {
    serverError(res, (error as Error).message);
  }
});

// GET /public/events/:id - Public event detail
router.get(
  '/events/:id',
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const event = await eventService.getEventById(req.params.id as string);
      if (!event || !event.isPublic) return notFound(res, 'Event');
      success(res, event);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

// ==========================================
// PUBLIC SERMONS
// ==========================================

// GET /public/sermons - Public sermon listing
router.get(
  '/sermons',
  [
    commonValidators.page,
    commonValidators.limit,
    query('churchId').optional().trim(),
    query('category').optional().trim(),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const result = await sermonService.getSermons({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        churchId: req.query.churchId as string,
        category: req.query.category as SermonCategory,
        isPublished: true,
      });
      successWithPagination(res, result.data, result.pagination);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

// GET /public/sermons/latest - Latest published sermons
router.get('/sermons/latest', async (req: Request, res: Response) => {
  try {
    const sermons = await sermonService.getLatestSermons(
      parseInt(req.query.limit as string) || 3,
      req.query.churchId as string | null
    );
    success(res, sermons);
  } catch (error) {
    serverError(res, (error as Error).message);
  }
});

// GET /public/sermons/:id - Public sermon detail
router.get(
  '/sermons/:id',
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const sermon = await sermonService.getSermonById(req.params.id as string);
      if (!sermon || !sermon.isPublished) return notFound(res, 'Sermon');
      success(res, sermon);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

// ==========================================
// PUBLIC MINISTRIES
// ==========================================

// GET /public/ministries - Public ministry listing
router.get(
  '/ministries',
  [
    commonValidators.page,
    commonValidators.limit,
    query('churchId').optional().trim(),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const result = await ministryService.getMinistries({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        churchId: req.query.churchId as string,
        isActive: true,
      });
      successWithPagination(res, result.data, result.pagination);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

// ==========================================
// PUBLIC QUESTIONS (Registration Form)
// ==========================================

// GET /public/questions/registration - Get registration questions grouped by category
router.get('/questions/registration', async (req: Request, res: Response) => {
  try {
    const grouped = await questionService.getRegistrationQuestions(
      req.query.churchId as string | null
    );
    success(res, grouped);
  } catch (error) {
    serverError(res, (error as Error).message);
  }
});

export default router;
