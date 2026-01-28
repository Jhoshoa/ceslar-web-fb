/**
 * Validation Utilities
 *
 * Custom validators and validation middleware for express-validator.
 */

const { validationResult, body, param, query } = require('express-validator');
const { badRequest, validationError } = require('./response.utils');

/**
 * Handle validation errors
 *
 * Middleware to check for validation errors and return formatted response.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return validationError(res, formattedErrors);
  }

  next();
}

/**
 * Common validation chains
 */
const commonValidators = {
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
  url: (field) =>
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
  date: (field) =>
    body(field)
      .optional()
      .isISO8601()
      .withMessage(`${field} must be a valid ISO date`),

  // Multilingual content
  multilingualText: (field, required = false) => {
    const validator = body(field);

    if (required) {
      return validator
        .notEmpty()
        .withMessage(`${field} is required`)
        .custom((value) => {
          if (typeof value !== 'object') {
            throw new Error(`${field} must be an object with language keys`);
          }
          if (!value.es) {
            throw new Error(`${field} must have at least Spanish (es) content`);
          }
          return true;
        });
    }

    return validator
      .optional()
      .custom((value) => {
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
const churchLevels = ['headquarters', 'country', 'department', 'province', 'local'];

const churchLevelValidator = body('level')
  .optional()
  .isIn(churchLevels)
  .withMessage(`Level must be one of: ${churchLevels.join(', ')}`);

/**
 * Validate church roles
 */
const churchRoles = ['admin', 'pastor', 'leader', 'staff', 'member', 'visitor'];

const churchRoleValidator = body('role')
  .isIn(churchRoles)
  .withMessage(`Role must be one of: ${churchRoles.join(', ')}`);

/**
 * Validate system roles
 */
const systemRoles = ['system_admin', 'user'];

const systemRoleValidator = body('systemRole')
  .isIn(systemRoles)
  .withMessage(`System role must be one of: ${systemRoles.join(', ')}`);

/**
 * Validate event types
 */
const eventTypes = [
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
];

const eventTypeValidator = body('type')
  .optional()
  .isIn(eventTypes)
  .withMessage(`Event type must be one of: ${eventTypes.join(', ')}`);

/**
 * Validate event status
 */
const eventStatuses = ['draft', 'published', 'cancelled', 'completed'];

const eventStatusValidator = body('status')
  .optional()
  .isIn(eventStatuses)
  .withMessage(`Status must be one of: ${eventStatuses.join(', ')}`);

/**
 * Validate question types
 */
const questionTypes = ['text', 'textarea', 'select', 'radio', 'checkbox', 'date', 'number'];

const questionTypeValidator = body('questionType')
  .isIn(questionTypes)
  .withMessage(`Question type must be one of: ${questionTypes.join(', ')}`);

/**
 * Sanitize input - remove dangerous characters
 */
function sanitizeInput(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Custom sanitizer for express-validator
 */
const sanitize = {
  text: (field) => body(field).customSanitizer(sanitizeInput),
};

module.exports = {
  handleValidationErrors,
  commonValidators,
  churchLevelValidator,
  churchRoleValidator,
  systemRoleValidator,
  eventTypeValidator,
  eventStatusValidator,
  questionTypeValidator,
  sanitize,
  churchLevels,
  churchRoles,
  systemRoles,
  eventTypes,
  eventStatuses,
  questionTypes,
};
