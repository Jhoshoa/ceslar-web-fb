/**
 * Memberships Routes
 *
 * API endpoints for church membership management.
 * All routes require authentication.
 */

import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';

import * as membershipService from '../services/membership.service';
import { isSystemAdmin, isChurchAdmin } from '../services/auth.service';
import {
  handleValidationErrors,
} from '../utils/validation.utils';
import {
  success,
  noContent,
  notFound,
  badRequest,
  forbidden,
  serverError,
} from '../utils/response.utils';
import { ChurchRole } from '@ceslar/shared-types';

const router = Router();

/**
 * POST /memberships/request
 * Request membership to a church
 */
router.post(
  '/request',
  [
    body('churchId').notEmpty(),
    body('answers').optional().isArray(),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      const result = await membershipService.requestMembership(
        req.userId!,
        req.body.churchId,
        req.body.answers
      );
      success(res, result);
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes('not found')) {
        return notFound(res, message);
      }
      if (message.includes('Already')) {
        return badRequest(res, message);
      }
      serverError(res, message);
    }
  }
);

/**
 * GET /memberships/my
 * Get current user's memberships
 */
router.get('/my', async (req: Request, res: Response) => {
  try {
    const memberships = await membershipService.getMyMemberships(req.userId!);
    success(res, memberships);
  } catch (error) {
    serverError(res, (error as Error).message);
  }
});

/**
 * DELETE /memberships/churches/:churchId/leave
 * Leave a church
 */
router.delete(
  '/churches/:churchId/leave',
  [param('churchId').notEmpty(), handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      await membershipService.leaveChurch(req.userId!, req.params.churchId as string);
      noContent(res);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * GET /memberships/churches/:churchId/pending
 * Get pending membership requests (church admin only)
 */
router.get(
  '/churches/:churchId/pending',
  [param('churchId').notEmpty(), handleValidationErrors],
  async (req: Request, res: Response) => {
    try {
      if (!isSystemAdmin(req.user!) && !isChurchAdmin(req.user!, req.params.churchId as string)) {
        return forbidden(res, 'Unauthorized');
      }
      const requests = await membershipService.getPendingRequests(req.params.churchId as string);
      success(res, requests);
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * PUT /memberships/churches/:churchId/approve/:userId
 * Approve membership request (church admin only)
 */
router.put(
  '/churches/:churchId/approve/:userId',
  [
    param('churchId').notEmpty(),
    param('userId').notEmpty(),
    body('role').optional().isIn(['admin', 'pastor', 'leader', 'staff', 'member', 'visitor']),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      if (!isSystemAdmin(req.user!) && !isChurchAdmin(req.user!, req.params.churchId as string)) {
        return forbidden(res, 'Unauthorized');
      }
      await membershipService.approveMembership(
        req.params.churchId as string,
        req.params.userId as string,
        (req.body.role as ChurchRole) || 'member'
      );
      success(res, { message: 'Membership approved' });
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes('not found')) {
        return notFound(res, message);
      }
      serverError(res, message);
    }
  }
);

/**
 * PUT /memberships/churches/:churchId/reject/:userId
 * Reject membership request (church admin only)
 */
router.put(
  '/churches/:churchId/reject/:userId',
  [
    param('churchId').notEmpty(),
    param('userId').notEmpty(),
    body('reason').optional().trim(),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      if (!isSystemAdmin(req.user!) && !isChurchAdmin(req.user!, req.params.churchId as string)) {
        return forbidden(res, 'Unauthorized');
      }
      await membershipService.rejectMembership(
        req.params.churchId as string,
        req.params.userId as string,
        req.body.reason
      );
      success(res, { message: 'Membership rejected' });
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

/**
 * PUT /memberships/churches/:churchId/members/:userId/role
 * Update member role (church admin only)
 */
router.put(
  '/churches/:churchId/members/:userId/role',
  [
    param('churchId').notEmpty(),
    param('userId').notEmpty(),
    body('role').isIn(['admin', 'pastor', 'leader', 'staff', 'member', 'visitor']),
    handleValidationErrors,
  ],
  async (req: Request, res: Response) => {
    try {
      if (!isSystemAdmin(req.user!) && !isChurchAdmin(req.user!, req.params.churchId as string)) {
        return forbidden(res, 'Unauthorized');
      }
      await membershipService.updateMemberRole(
        req.params.churchId as string,
        req.params.userId as string,
        req.body.role as ChurchRole
      );
      success(res, { message: 'Role updated' });
    } catch (error) {
      serverError(res, (error as Error).message);
    }
  }
);

export default router;
