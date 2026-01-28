/**
 * Public Routes
 *
 * Unauthenticated endpoints for public-facing content.
 * These provide read-only access to published content.
 */

const express = require('express');
const { query } = require('express-validator');
const router = express.Router();

const churchService = require('../services/church.service');
const eventService = require('../services/event.service');
const sermonService = require('../services/sermon.service');
const ministryService = require('../services/ministry.service');
const questionService = require('../services/question.service');
const { handleValidationErrors, commonValidators } = require('../utils/validation.utils');
const { success, successWithPagination, notFound, serverError } = require('../utils/response.utils');

// ==========================================
// PUBLIC CHURCHES
// ==========================================

// GET /public/churches - Public church listing
router.get('/churches', [
  commonValidators.page,
  commonValidators.limit,
  query('country').optional().trim(),
  query('level').optional().isIn(['headquarters', 'country', 'department', 'province', 'local']),
  query('search').optional().trim(),
  handleValidationErrors,
], async (req, res) => {
  try {
    const result = await churchService.getChurches({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      country: req.query.country,
      level: req.query.level,
      search: req.query.search,
      status: 'active',
    });
    successWithPagination(res, result.data, result.pagination);
  } catch (error) {
    serverError(res, error.message);
  }
});

// GET /public/churches/featured - Featured churches
router.get('/churches/featured', async (req, res) => {
  try {
    const churches = await churchService.getFeaturedChurches(parseInt(req.query.limit) || 4);
    success(res, churches);
  } catch (error) {
    serverError(res, error.message);
  }
});

// GET /public/churches/countries - Available countries
router.get('/churches/countries', async (req, res) => {
  try {
    const countries = await churchService.getCountries();
    success(res, countries);
  } catch (error) {
    serverError(res, error.message);
  }
});

// GET /public/churches/:id - Church detail
router.get('/churches/:id', [commonValidators.id, handleValidationErrors], async (req, res) => {
  try {
    const church = await churchService.getChurchById(req.params.id, true);
    if (!church || church.status !== 'active') return notFound(res, 'Church');
    success(res, church);
  } catch (error) {
    serverError(res, error.message);
  }
});

// ==========================================
// PUBLIC EVENTS
// ==========================================

// GET /public/events - Public events listing
router.get('/events', [
  commonValidators.page,
  commonValidators.limit,
  query('churchId').optional().trim(),
  query('type').optional().trim(),
  handleValidationErrors,
], async (req, res) => {
  try {
    const result = await eventService.getEvents({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      churchId: req.query.churchId,
      type: req.query.type,
      isPublic: true,
      status: 'published',
    });
    successWithPagination(res, result.data, result.pagination);
  } catch (error) {
    serverError(res, error.message);
  }
});

// GET /public/events/upcoming - Upcoming public events
router.get('/events/upcoming', async (req, res) => {
  try {
    const events = await eventService.getUpcomingEvents(
      parseInt(req.query.limit) || 5,
      req.query.churchId,
    );
    success(res, events);
  } catch (error) {
    serverError(res, error.message);
  }
});

// GET /public/events/:id - Public event detail
router.get('/events/:id', [commonValidators.id, handleValidationErrors], async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event || !event.isPublic) return notFound(res, 'Event');
    success(res, event);
  } catch (error) {
    serverError(res, error.message);
  }
});

// ==========================================
// PUBLIC SERMONS
// ==========================================

// GET /public/sermons - Public sermon listing
router.get('/sermons', [
  commonValidators.page,
  commonValidators.limit,
  query('churchId').optional().trim(),
  query('category').optional().trim(),
  handleValidationErrors,
], async (req, res) => {
  try {
    const result = await sermonService.getSermons({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      churchId: req.query.churchId,
      category: req.query.category,
      isPublished: true,
    });
    successWithPagination(res, result.data, result.pagination);
  } catch (error) {
    serverError(res, error.message);
  }
});

// GET /public/sermons/latest - Latest published sermons
router.get('/sermons/latest', async (req, res) => {
  try {
    const sermons = await sermonService.getLatestSermons(
      parseInt(req.query.limit) || 3,
      req.query.churchId,
    );
    success(res, sermons);
  } catch (error) {
    serverError(res, error.message);
  }
});

// GET /public/sermons/:id - Public sermon detail
router.get('/sermons/:id', [commonValidators.id, handleValidationErrors], async (req, res) => {
  try {
    const sermon = await sermonService.getSermonById(req.params.id);
    if (!sermon || !sermon.isPublished) return notFound(res, 'Sermon');
    success(res, sermon);
  } catch (error) {
    serverError(res, error.message);
  }
});

// ==========================================
// PUBLIC MINISTRIES
// ==========================================

// GET /public/ministries - Public ministry listing
router.get('/ministries', [
  commonValidators.page,
  commonValidators.limit,
  query('churchId').optional().trim(),
  handleValidationErrors,
], async (req, res) => {
  try {
    const result = await ministryService.getMinistries({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      churchId: req.query.churchId,
      isActive: true,
    });
    successWithPagination(res, result.data, result.pagination);
  } catch (error) {
    serverError(res, error.message);
  }
});

// ==========================================
// PUBLIC QUESTIONS (Registration Form)
// ==========================================

// GET /public/questions/registration - Get registration questions grouped by category
router.get('/questions/registration', async (req, res) => {
  try {
    const grouped = await questionService.getRegistrationQuestions(req.query.churchId);
    success(res, grouped);
  } catch (error) {
    serverError(res, error.message);
  }
});

module.exports = router;
