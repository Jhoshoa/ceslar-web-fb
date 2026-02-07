/**
 * Validation Utilities
 *
 * Custom validators and validation middleware for express-validator.
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, body, param, query, ValidationChain } from 'express-validator';
import { validationError } from './response.utils';

/**
 * Validation error format
 */
interface FormattedError {
  field: string;
  message: string;
  value: unknown;
}

/**
 * Handle validation errors
 *
 * Middleware to check for validation errors and return formatted response.
 */
export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors: FormattedError[] = errors.array().map((err) => ({
      field: 'path' in err ? err.path : 'unknown',
      message: err.msg,
      value: 'value' in err ? err.value : undefined,
    }));

    return validationError(res, formattedErrors);
  }

  next();
}

/**
 * Common validation chains
 */
export const commonValidators = {
  // ID validation
  id: param('id')
    .trim()
    .notEmpty()
    .withMessage('ID is required')
    .isLength({ min: 1, max: 128 })
    .withMessage('Invalid ID format'),

  // Pagination
  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  // Search
  search: query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query too long'),

  // Email
  email: body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),

  // Password
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),

  // Name fields
  name: body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  displayName: body('displayName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Display name must be at most 100 characters'),

  // URL validation
  url: (field: string): ValidationChain =>
    body(field)
      .optional()
      .trim()
      .isURL()
      .withMessage(`${field} must be a valid URL`),

  // Phone number
  phoneNumber: body('phoneNumber')
    .optional()
    .trim()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Invalid phone number format'),

  // Date validation
  date: (field: string): ValidationChain =>
    body(field)
      .optional()
      .isISO8601()
      .withMessage(`${field} must be a valid ISO date`),

  // Multilingual content
  multilingualText: (field: string, required: boolean = false): ValidationChain => {
    const validator = body(field);

    if (required) {
      return validator
        .notEmpty()
        .withMessage(`${field} is required`)
        .custom((value: unknown) => {
          if (typeof value !== 'object') {
            throw new Error(`${field} must be an object with language keys`);
          }
          if (!(value as Record<string, unknown>).es) {
            throw new Error(`${field} must have at least Spanish (es) content`);
          }
          return true;
        });
    }

    return validator
      .optional()
      .custom((value: unknown) => {
        if (value && typeof value !== 'object') {
          throw new Error(`${field} must be an object with language keys`);
        }
        return true;
      });
  },
};

/**
 * Validate church level
 */
export const churchLevels = ['headquarters', 'country', 'department', 'province', 'local'] as const;

export const churchLevelValidator: ValidationChain = body('level')
  .optional()
  .isIn(churchLevels)
  .withMessage(`Level must be one of: ${churchLevels.join(', ')}`);

/**
 * Validate church roles
 */
export const churchRoles = ['admin', 'pastor', 'leader', 'staff', 'member', 'visitor'] as const;

export const churchRoleValidator: ValidationChain = body('role')
  .isIn(churchRoles)
  .withMessage(`Role must be one of: ${churchRoles.join(', ')}`);

/**
 * Validate system roles
 */
export const systemRoles = ['system_admin', 'user'] as const;

export const systemRoleValidator: ValidationChain = body('systemRole')
  .isIn(systemRoles)
  .withMessage(`System role must be one of: ${systemRoles.join(', ')}`);

/**
 * Validate event types
 */
export const eventTypes = [
  'service',
  'bible_study',
  'prayer_meeting',
  'youth_meeting',
  'conference',
  'workshop',
  'camp',
  'outreach',
  'special_event',
  'other',
] as const;

export const eventTypeValidator: ValidationChain = body('type')
  .optional()
  .isIn(eventTypes)
  .withMessage(`Event type must be one of: ${eventTypes.join(', ')}`);

/**
 * Validate event status
 */
export const eventStatuses = ['draft', 'published', 'cancelled', 'completed'] as const;

export const eventStatusValidator: ValidationChain = body('status')
  .optional()
  .isIn(eventStatuses)
  .withMessage(`Status must be one of: ${eventStatuses.join(', ')}`);

/**
 * Validate question types
 */
export const questionTypes = ['text', 'textarea', 'select', 'radio', 'checkbox', 'date', 'number'] as const;

export const questionTypeValidator: ValidationChain = body('questionType')
  .isIn(questionTypes)
  .withMessage(`Question type must be one of: ${questionTypes.join(', ')}`);

/**
 * Sanitize input - remove dangerous characters
 */
export function sanitizeInput(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Custom sanitizer for express-validator
 */
export const sanitize = {
  text: (field: string): ValidationChain => body(field).customSanitizer(sanitizeInput),
};

/**
 * Helper to safely extract a string param from request
 * Express params can be string | string[] in some type definitions
 */
export function getParam(req: Request, paramName: string): string {
  const value = req.params[paramName];
  return Array.isArray(value) ? value[0] : (value || '');
}

/**
 * Helper to safely extract a string query param from request
 */
export function getQuery(req: Request, queryName: string): string | undefined {
  const value = req.query[queryName];
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0]?.toString() : value.toString();
}
