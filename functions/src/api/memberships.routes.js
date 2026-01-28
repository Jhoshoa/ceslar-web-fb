/**
 * Memberships Routes
 */

const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const membershipService = require('../services/membership.service');
const { requireChurchAdmin } = require('../middleware/permissions.middleware');
const { handleValidationErrors, commonValidators, churchRoleValidator } = require('../utils/validation.utils');
const { success, noContent, notFound, badRequest, serverError } = require('../utils/response.utils');

// POST /memberships/request - Request membership
router.post('/request', [
  body('churchId').notEmpty(),
  body('answers').optional().isArray(),
  handleValidationErrors,
], async (req, res) => {
  try {
    const result = await membershipService.requestMembership(req.userId, req.body.churchId, req.body.answers);
    success(res, result);
  } catch (error) {
    if (error.message.includes('not found')) return notFound(res, error.message);
    if (error.message.includes('Already')) return badRequest(res, error.message);
    serverError(res, error.message);
  }
});

// GET /memberships/my - Get my memberships
router.get('/my', async (req, res) => {
  try {
    const memberships = await membershipService.getMyMemberships(req.userId);
    success(res, memberships);
  } catch (error) {
    serverError(res, error.message);
  }
});

// DELETE /memberships/churches/:churchId/leave - Leave church
router.delete('/churches/:churchId/leave', [
  param('churchId').notEmpty(),
  handleValidationErrors,
], async (req, res) => {
  try {
    await membershipService.leaveChurch(req.userId, req.params.churchId);
    noContent(res);
  } catch (error) {
    serverError(res, error.message);
  }
});

// GET /memberships/churches/:churchId/pending - Get pending requests (admin)
router.get('/churches/:churchId/pending', [
  param('churchId').notEmpty(),
  handleValidationErrors,
], async (req, res) => {
  try {
    const { isSystemAdmin, isChurchAdmin } = require('../services/auth.service');
    if (!isSystemAdmin(req.user) && !isChurchAdmin(req.user, req.params.churchId)) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const requests = await membershipService.getPendingRequests(req.params.churchId);
    success(res, requests);
  } catch (error) {
    serverError(res, error.message);
  }
});

// PUT /memberships/churches/:churchId/approve/:userId - Approve membership
router.put('/churches/:churchId/approve/:userId', [
  param('churchId').notEmpty(),
  param('userId').notEmpty(),
  body('role').optional().isIn(['admin', 'pastor', 'leader', 'staff', 'member', 'visitor']),
  handleValidationErrors,
], async (req, res) => {
  try {
    const { isSystemAdmin, isChurchAdmin } = require('../services/auth.service');
    if (!isSystemAdmin(req.user) && !isChurchAdmin(req.user, req.params.churchId)) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
    }
    await membershipService.approveMembership(req.params.churchId, req.params.userId, req.body.role || 'member');
    success(res, { message: 'Membership approved' });
  } catch (error) {
    if (error.message.includes('not found')) return notFound(res, error.message);
    serverError(res, error.message);
  }
});

// PUT /memberships/churches/:churchId/reject/:userId - Reject membership
router.put('/churches/:churchId/reject/:userId', [
  param('churchId').notEmpty(),
  param('userId').notEmpty(),
  body('reason').optional().trim(),
  handleValidationErrors,
], async (req, res) => {
  try {
    const { isSystemAdmin, isChurchAdmin } = require('../services/auth.service');
    if (!isSystemAdmin(req.user) && !isChurchAdmin(req.user, req.params.churchId)) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
    }
    await membershipService.rejectMembership(req.params.churchId, req.params.userId, req.body.reason);
    success(res, { message: 'Membership rejected' });
  } catch (error) {
    serverError(res, error.message);
  }
});

// PUT /memberships/churches/:churchId/members/:userId/role - Update member role
router.put('/churches/:churchId/members/:userId/role', [
  param('churchId').notEmpty(),
  param('userId').notEmpty(),
  body('role').isIn(['admin', 'pastor', 'leader', 'staff', 'member', 'visitor']),
  handleValidationErrors,
], async (req, res) => {
  try {
    const { isSystemAdmin, isChurchAdmin } = require('../services/auth.service');
    if (!isSystemAdmin(req.user) && !isChurchAdmin(req.user, req.params.churchId)) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
    }
    await membershipService.updateMemberRole(req.params.churchId, req.params.userId, req.body.role);
    success(res, { message: 'Role updated' });
  } catch (error) {
    serverError(res, error.message);
  }
});

module.exports = router;
