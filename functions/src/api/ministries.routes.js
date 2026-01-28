/**
 * Ministries Routes
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const ministryService = require('../services/ministry.service');
const { verifyToken, optionalAuth } = require('../middleware/auth.middleware');
const { handleValidationErrors, commonValidators } = require('../utils/validation.utils');
const { success, successWithPagination, created, noContent, notFound, serverError } = require('../utils/response.utils');

router.get('/', optionalAuth, [commonValidators.page, commonValidators.limit, handleValidationErrors], async (req, res) => {
  try {
    const result = await ministryService.getMinistries({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      ...req.query,
    });
    successWithPagination(res, result.data, result.pagination);
  } catch (error) {
    serverError(res, error.message);
  }
});

router.get('/:id', [commonValidators.id, handleValidationErrors], async (req, res) => {
  try {
    const ministry = await ministryService.getMinistryById(req.params.id);
    if (!ministry) return notFound(res, 'Ministry');
    success(res, ministry);
  } catch (error) {
    serverError(res, error.message);
  }
});

router.post('/', verifyToken, [
  body('name').notEmpty(),
  body('churchId').notEmpty(),
  handleValidationErrors,
], async (req, res) => {
  try {
    const ministry = await ministryService.createMinistry(req.body, req.userId);
    created(res, ministry);
  } catch (error) {
    serverError(res, error.message);
  }
});

router.put('/:id', verifyToken, [commonValidators.id, handleValidationErrors], async (req, res) => {
  try {
    const ministry = await ministryService.updateMinistry(req.params.id, req.body);
    success(res, ministry);
  } catch (error) {
    if (error.message === 'Ministry not found') return notFound(res, 'Ministry');
    serverError(res, error.message);
  }
});

router.delete('/:id', verifyToken, [commonValidators.id, handleValidationErrors], async (req, res) => {
  try {
    await ministryService.deleteMinistry(req.params.id);
    noContent(res);
  } catch (error) {
    serverError(res, error.message);
  }
});

module.exports = router;
