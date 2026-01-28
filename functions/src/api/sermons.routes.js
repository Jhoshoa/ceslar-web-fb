/**
 * Sermons Routes
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const sermonService = require('../services/sermon.service');
const { verifyToken, optionalAuth } = require('../middleware/auth.middleware');
const { handleValidationErrors, commonValidators } = require('../utils/validation.utils');
const { success, successWithPagination, created, noContent, notFound, serverError } = require('../utils/response.utils');

router.get('/', optionalAuth, [commonValidators.page, commonValidators.limit, handleValidationErrors], async (req, res) => {
  try {
    const result = await sermonService.getSermons({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      ...req.query,
    });
    successWithPagination(res, result.data, result.pagination);
  } catch (error) {
    serverError(res, error.message);
  }
});

router.get('/latest', async (req, res) => {
  try {
    const sermons = await sermonService.getLatestSermons(parseInt(req.query.limit) || 3, req.query.churchId);
    success(res, sermons);
  } catch (error) {
    serverError(res, error.message);
  }
});

router.get('/featured', async (req, res) => {
  try {
    const sermons = await sermonService.getFeaturedSermons(parseInt(req.query.limit) || 3);
    success(res, sermons);
  } catch (error) {
    serverError(res, error.message);
  }
});

router.get('/:id', [commonValidators.id, handleValidationErrors], async (req, res) => {
  try {
    const sermon = await sermonService.getSermonById(req.params.id);
    if (!sermon) return notFound(res, 'Sermon');
    success(res, sermon);
  } catch (error) {
    serverError(res, error.message);
  }
});

router.post('/', verifyToken, [
  body('title').notEmpty(),
  body('churchId').notEmpty(),
  handleValidationErrors,
], async (req, res) => {
  try {
    const sermon = await sermonService.createSermon(req.body, req.userId);
    created(res, sermon);
  } catch (error) {
    serverError(res, error.message);
  }
});

router.put('/:id', verifyToken, [commonValidators.id, handleValidationErrors], async (req, res) => {
  try {
    const sermon = await sermonService.updateSermon(req.params.id, req.body);
    success(res, sermon);
  } catch (error) {
    if (error.message === 'Sermon not found') return notFound(res, 'Sermon');
    serverError(res, error.message);
  }
});

router.delete('/:id', verifyToken, [commonValidators.id, handleValidationErrors], async (req, res) => {
  try {
    await sermonService.deleteSermon(req.params.id);
    noContent(res);
  } catch (error) {
    serverError(res, error.message);
  }
});

router.post('/:id/views', [commonValidators.id, handleValidationErrors], async (req, res) => {
  try {
    await sermonService.incrementViews(req.params.id);
    success(res, { success: true });
  } catch (error) {
    serverError(res, error.message);
  }
});

module.exports = router;
