/**
 * Questions Routes
 *
 * Endpoints for managing registration questions and categories.
 */

const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

const questionService = require('../services/question.service');
const { verifyToken, optionalAuth } = require('../middleware/auth.middleware');
const { requireSystemAdmin } = require('../middleware/permissions.middleware');
const { handleValidationErrors, commonValidators, questionTypeValidator } = require('../utils/validation.utils');
const { success, created, noContent, notFound, badRequest, serverError } = require('../utils/response.utils');

// ==========================================
// PUBLIC / AUTH ROUTES
// ==========================================

// GET /questions - Get all active questions (optionally filtered)
router.get('/', optionalAuth, [
  query('categoryId').optional().trim(),
  query('targetAudience').optional().isIn(['all', 'new_members', 'existing_members']),
  query('scope').optional().isIn(['global', 'church']),
  query('churchId').optional().trim(),
  handleValidationErrors,
], async (req, res) => {
  try {
    const questions = await questionService.getQuestions({
      categoryId: req.query.categoryId,
      targetAudience: req.query.targetAudience,
      scope: req.query.scope,
      churchId: req.query.churchId,
      isActive: true,
    });
    success(res, questions);
  } catch (error) {
    serverError(res, error.message);
  }
});

// GET /questions/categories - Get all active categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await questionService.getCategories({ isActive: true });
    success(res, categories);
  } catch (error) {
    serverError(res, error.message);
  }
});

// GET /questions/registration - Get questions grouped for registration form
router.get('/registration', async (req, res) => {
  try {
    const grouped = await questionService.getRegistrationQuestions(req.query.churchId);
    success(res, grouped);
  } catch (error) {
    serverError(res, error.message);
  }
});

// GET /questions/:id - Get question by ID
router.get('/:id', [commonValidators.id, handleValidationErrors], async (req, res) => {
  try {
    const question = await questionService.getQuestionById(req.params.id);
    if (!question) return notFound(res, 'Question');
    success(res, question);
  } catch (error) {
    serverError(res, error.message);
  }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

// POST /questions - Create question (admin only)
router.post('/', verifyToken, requireSystemAdmin, [
  body('categoryId').notEmpty().withMessage('Category ID is required'),
  body('questionText').notEmpty().withMessage('Question text is required'),
  questionTypeValidator,
  body('options').optional().isArray(),
  body('targetAudience').optional().isIn(['all', 'new_members', 'existing_members']),
  body('scope').optional().isIn(['global', 'church']),
  handleValidationErrors,
], async (req, res) => {
  try {
    // Validate category exists
    const category = await questionService.getCategoryById(req.body.categoryId);
    if (!category) return notFound(res, 'Category');

    // Auto-fill categoryName from category
    req.body.categoryName = category.name;

    const question = await questionService.createQuestion(req.body);
    created(res, question);
  } catch (error) {
    serverError(res, error.message);
  }
});

// PUT /questions/:id - Update question (admin only)
router.put('/:id', verifyToken, requireSystemAdmin, [
  commonValidators.id,
  handleValidationErrors,
], async (req, res) => {
  try {
    const question = await questionService.updateQuestion(req.params.id, req.body);
    success(res, question);
  } catch (error) {
    if (error.message === 'Question not found') return notFound(res, 'Question');
    serverError(res, error.message);
  }
});

// DELETE /questions/:id - Delete question (admin only)
router.delete('/:id', verifyToken, requireSystemAdmin, [
  commonValidators.id,
  handleValidationErrors,
], async (req, res) => {
  try {
    await questionService.deleteQuestion(req.params.id);
    noContent(res);
  } catch (error) {
    if (error.message === 'Question not found') return notFound(res, 'Question');
    serverError(res, error.message);
  }
});

// PUT /questions/reorder/:categoryId - Reorder questions in category (admin only)
router.put('/reorder/:categoryId', verifyToken, requireSystemAdmin, [
  body('orderedIds').isArray({ min: 1 }).withMessage('orderedIds must be a non-empty array'),
  handleValidationErrors,
], async (req, res) => {
  try {
    await questionService.reorderQuestions(req.params.categoryId, req.body.orderedIds);
    success(res, { message: 'Questions reordered successfully' });
  } catch (error) {
    serverError(res, error.message);
  }
});

// ==========================================
// CATEGORY ADMIN ROUTES
// ==========================================

// POST /questions/categories - Create category (admin only)
router.post('/categories', verifyToken, requireSystemAdmin, [
  body('name').notEmpty().withMessage('Name is required'),
  handleValidationErrors,
], async (req, res) => {
  try {
    const category = await questionService.createCategory(req.body);
    created(res, category);
  } catch (error) {
    serverError(res, error.message);
  }
});

// PUT /questions/categories/:id - Update category (admin only)
router.put('/categories/:id', verifyToken, requireSystemAdmin, [
  commonValidators.id,
  handleValidationErrors,
], async (req, res) => {
  try {
    const category = await questionService.updateCategory(req.params.id, req.body);
    success(res, category);
  } catch (error) {
    if (error.message === 'Category not found') return notFound(res, 'Category');
    serverError(res, error.message);
  }
});

// DELETE /questions/categories/:id - Delete category (admin only)
router.delete('/categories/:id', verifyToken, requireSystemAdmin, [
  commonValidators.id,
  handleValidationErrors,
], async (req, res) => {
  try {
    await questionService.deleteCategory(req.params.id);
    noContent(res);
  } catch (error) {
    if (error.message.includes('Cannot delete')) return badRequest(res, error.message);
    if (error.message === 'Category not found') return notFound(res, 'Category');
    serverError(res, error.message);
  }
});

// GET /questions/categories/:id - Get single category (admin)
router.get('/categories/:id', [commonValidators.id, handleValidationErrors], async (req, res) => {
  try {
    const category = await questionService.getCategoryById(req.params.id);
    if (!category) return notFound(res, 'Category');
    success(res, category);
  } catch (error) {
    serverError(res, error.message);
  }
});

module.exports = router;
