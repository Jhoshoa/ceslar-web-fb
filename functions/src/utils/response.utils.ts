/**
 * Response Utilities
 *
 * Standardized response formatting for API endpoints.
 */

import { Response } from 'express';
import { PaginationInfo } from '@ceslar/shared-types';

/**
 * Error details in response
 */
interface ErrorDetails {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Send success response
 */
export function success<T>(res: Response, data: T, status: number = 200): void {
  res.status(status).json({
    success: true,
    data,
  });
}

/**
 * Send success response with pagination
 */
export function successWithPagination<T>(
  res: Response,
  data: T[],
  pagination: PaginationInfo,
  status: number = 200
): void {
  res.status(status).json({
    success: true,
    data,
    pagination,
  });
}

/**
 * Send created response (201)
 */
export function created<T>(res: Response, data: T): void {
  res.status(201).json({
    success: true,
    data,
  });
}

/**
 * Send no content response (204)
 */
export function noContent(res: Response): void {
  res.status(204).send();
}

/**
 * Send error response
 */
export function error(
  res: Response,
  code: string,
  message: string,
  status: number = 400,
  details: unknown = null
): void {
  const response: { success: false; error: ErrorDetails } = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  res.status(status).json(response);
}

/**
 * Send bad request error (400)
 */
export function badRequest(
  res: Response,
  message: string,
  details: unknown = null
): void {
  error(res, 'bad-request', message, 400, details);
}

/**
 * Send unauthorized error (401)
 */
export function unauthorized(
  res: Response,
  message: string = 'Authentication required'
): void {
  error(res, 'unauthorized', message, 401);
}

/**
 * Send forbidden error (403)
 */
export function forbidden(res: Response, message: string = 'Access denied'): void {
  error(res, 'forbidden', message, 403);
}

/**
 * Send not found error (404)
 */
export function notFound(res: Response, resource: string = 'Resource'): void {
  error(res, 'not-found', `${resource} not found`, 404);
}

/**
 * Send conflict error (409)
 */
export function conflict(res: Response, message: string): void {
  error(res, 'conflict', message, 409);
}

/**
 * Send validation error (422)
 */
export function validationError(res: Response, errors: unknown[]): void {
  error(res, 'validation-error', 'Validation failed', 422, errors);
}

/**
 * Send internal server error (500)
 */
export function serverError(
  res: Response,
  message: string = 'Internal server error'
): void {
  error(res, 'internal-error', message, 500);
}
