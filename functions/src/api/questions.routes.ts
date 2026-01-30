/**
 * Questions Routes
 *
 * API endpoints for managing registration questions and categories.
 * Mixed authentication - some endpoints public, some require admin.
 */

import { Router, Request, Response } from 'express';
import { body, query } from 'express-validator';

import * as questionService from '../services/question.service';
import { verifyToken, optionalAuth } from '../middleware/auth.middleware';
import { requireSystemAdmin } from '../middleware/permissions.middleware';
import {
  handleValidationErrors,
  commonValidators,
  questionTypeValidator,
} from '../utils/validation.utils';
import {
  success,
  created,
  noContent,
  notFound,
  badRequest,
  serverError,
} from '../utils/response.utils';
import { QuestionScope, TargetAudience } from '@ceslar/shared-types';

const router = Router();

// ==========================================
// PUBLIC / AUTH ROUTES
// ==========================================

/**
 * GET /questions
 * Get all active questions (optionally filtered)
 */
router.get(
  '/',
  optionalAuth,
  [
    query('categoryId').optional().trim(),
    query('targetAudience').optional().isIn(['all', 'new_members', 'existing_members']),
    query('scope').optional().isIn(['global', 'church']),
    query('churchId').optional().trim(),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const questions = await questionService.getQuestions({
        categoryId: req.query.categoryId as string,
        targetAudience: req.query.targetAudience as TargetAudience,
        scope: req.query.scope as QuestionScope,
        churchId: req.query.churchId as string,
        isActive: true,
      });
      success(res, questions);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * GET /questions/categories
 * Get all active categories
 */
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await questionService.getCategories({ isActive: true });
    success(res, categories);
  } catch (error) {
    serverError(res, (error as Error).message);
  }
});

/**
 * GET /questions/registration
 * Get questions grouped for registration form
 */
router.get('/registration', async (req: Request, res: Response) => {
  try {
    const grouped = await questionService.getRegistrationQuestions(
      req.query.churchId as string
    );
    success(res, grouped);
  } catch (error) {
    serverError(res, (error as Error).message);
  }
});

/**
 * GET /questions/:id
 * Get question by ID
 */
router.get(
  '/:id',
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const question = await questionService.getQuestionById(req.params.id);
      if (!question) {
        return notFound(res, 'Question');
      }
      success(res, question);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

// ==========================================
// ADMIN ROUTES
// ==========================================

/**
 * POST /questions
 * Create question (admin only)
 */
router.post(
  '/',
  verifyToken,
  requireSystemAdmin,
  [
    body('categoryId').notEmpty().withMessage('Category ID is required'),
    body('questionText').notEmpty().withMessage('Question text is required'),
    questionTypeValidator,
    body('options').optional().isArray(),
    body('targetAudience').optional().isIn(['all', 'new_members', 'existing_members']),
    body('scope').optional().isIn(['global', 'church']),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      // Validate category exists
      const category = await questionService.getCategoryById(req.body.categoryId);
      if (!category) {
        return notFound(res, 'Category');
      }

      // Auto-fill categoryName from category
      req.body.categoryName = category.name;

      const question = await questionService.createQuestion(req.body);
      created(res, question);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * PUT /questions/:id
 * Update question (admin only)
 */
router.put(
  '/:id',
  verifyToken,
  requireSystemAdmin,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const question = await questionService.updateQuestion(req.params.id, req.body);
      success(res, question);
    } catch (error) {
      if ((error as Error).message === 'Question not found') {
        return notFound(res, 'Question');
      }
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * DELETE /questions/:id
 * Delete question (admin only)
 */
router.delete(
  '/:id',
  verifyToken,
  requireSystemAdmin,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      await questionService.deleteQuestion(req.params.id);
      noContent(res);
    } catch (error) {
      if ((error as Error).message === 'Question not found') {
        return notFound(res, 'Question');
      }
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * PUT /questions/reorder/:categoryId
 * Reorder questions in category (admin only)
 */
router.put(
  '/reorder/:categoryId',
  verifyToken,
  requireSystemAdmin,
  [
    body('orderedIds').isArray({ min: 1 }).withMessage('orderedIds must be a non-empty array'),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      await questionService.reorderQuestions(req.params.categoryId, req.body.orderedIds);
      success(res, { message: 'Questions reordered successfully' });
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

// ==========================================
// CATEGORY ADMIN ROUTES
// ==========================================

/**
 * POST /questions/categories
 * Create category (admin only)
 */
router.post(
  '/categories',
  verifyToken,
  requireSystemAdmin,
  [body('name').notEmpty().withMessage('Name is required'), handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const category = await questionService.createCategory(req.body);
      created(res, category);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * PUT /questions/categories/:id
 * Update category (admin only)
 */
router.put(
  '/categories/:id',
  verifyToken,
  requireSystemAdmin,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const category = await questionService.updateCategory(req.params.id, req.body);
      success(res, category);
    } catch (error) {
      if ((error as Error).message === 'Category not found') {
        return notFound(res, 'Category');
      }
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * DELETE /questions/categories/:id
 * Delete category (admin only)
 */
router.delete(
  '/categories/:id',
  verifyToken,
  requireSystemAdmin,
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      await questionService.deleteCategory(req.params.id);
      noContent(res);
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes('Cannot delete')) {
        return badRequest(res, message);
      }
      if (message === 'Category not found') {
        return notFound(res, 'Category');
      }
      serverError(res, message);
    }
  }
);

/**
 * GET /questions/categories/:id
 * Get single category
 */
router.get(
  '/categories/:id',
  [commonValidators.id, handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      const category = await questionService.getCategoryById(req.params.id);
      if (!category) {
        return notFound(res, 'Category');
      }
      success(res, category);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

export default router;
