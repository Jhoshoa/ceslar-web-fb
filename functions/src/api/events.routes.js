/**
 * Events Routes
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const eventService = require('../services/event.service');
const { verifyToken, optionalAuth } = require('../middleware/auth.middleware');
const { requireAuth } = require('../middleware/permissions.middleware');
const { handleValidationErrors, commonValidators } = require('../utils/validation.utils');
const { success, successWithPagination, created, noContent, notFound, serverError } = require('../utils/response.utils');

// GET /events - List events (public)
router.get('/', optionalAuth, [
  commonValidators.page,
  commonValidators.limit,
  query('churchId').optional().trim(),
  query('type').optional().trim(),
  query('status').optional().trim(),
  handleValidationErrors,
], async (req, res) => {
  try {
    const result = await eventService.getEvents({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      ...req.query,
      isPublic: !req.user ? true : undefined,
    });
    successWithPagination(res, result.data, result.pagination);
  } catch (error) {
    serverError(res, error.message);
  }
});

// GET /events/upcoming - Get upcoming events (public)
router.get('/upcoming', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const events = await eventService.getUpcomingEvents(limit, req.query.churchId);
    success(res, events);
  } catch (error) {
    serverError(res, error.message);
  }
});

// GET /events/:id - Get event by ID
router.get('/:id', optionalAuth, [commonValidators.id, handleValidationErrors], async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) return notFound(res, 'Event');
    success(res, event);
  } catch (error) {
    serverError(res, error.message);
  }
});

// POST /events - Create event (auth required)
router.post('/', verifyToken, [
  body('title').notEmpty(),
  body('churchId').notEmpty(),
  body('startDate').isISO8601(),
  handleValidationErrors,
], async (req, res) => {
  try {
    const event = await eventService.createEvent(req.body, req.userId);
    created(res, event);
  } catch (error) {
    serverError(res, error.message);
  }
});

// PUT /events/:id - Update event
router.put('/:id', verifyToken, [commonValidators.id, handleValidationErrors], async (req, res) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    success(res, event);
  } catch (error) {
    if (error.message === 'Event not found') return notFound(res, 'Event');
    serverError(res, error.message);
  }
});

// DELETE /events/:id - Delete event
router.delete('/:id', verifyToken, [commonValidators.id, handleValidationErrors], async (req, res) => {
  try {
    await eventService.deleteEvent(req.params.id);
    noContent(res);
  } catch (error) {
    serverError(res, error.message);
  }
});

// POST /events/:id/register - Register for event
router.post('/:id/register', verifyToken, [commonValidators.id, handleValidationErrors], async (req, res) => {
  try {
    await eventService.registerForEvent(req.params.id, req.userId, req.body);
    success(res, { message: 'Successfully registered' });
  } catch (error) {
    if (error.message === 'Event not found') return notFound(res, 'Event');
    serverError(res, error.message);
  }
});

// DELETE /events/:id/register - Cancel registration
router.delete('/:id/register', verifyToken, [commonValidators.id, handleValidationErrors], async (req, res) => {
  try {
    await eventService.cancelRegistration(req.params.id, req.userId);
    noContent(res);
  } catch (error) {
    serverError(res, error.message);
  }
});

module.exports = router;
