/**
 * Response Utilities
 *
 * Standardized response formatting for API endpoints.
 */

/**
 * Send success response
 *
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code (default: 200)
 */
function success(res, data, status = 200) {
  res.status(status).json({
    success: true,
    data,
  });
}

/**
 * Send success response with pagination
 *
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination info
 * @param {number} status - HTTP status code (default: 200)
 */
function successWithPagination(res, data, pagination, status = 200) {
  res.status(status).json({
    success: true,
    data,
    pagination,
  });
}

/**
 * Send created response (201)
 *
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 */
function created(res, data) {
  res.status(201).json({
    success: true,
    data,
  });
}

/**
 * Send no content response (204)
 *
 * @param {Object} res - Express response object
 */
function noContent(res) {
  res.status(204).send();
}

/**
 * Send error response
 *
 * @param {Object} res - Express response object
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 400)
 * @param {Object} details - Additional error details
 */
function error(res, code, message, status = 400, details = null) {
  const response = {
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
 *
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Object} details - Validation details
 */
function badRequest(res, message, details = null) {
  error(res, 'bad-request', message, 400, details);
}

/**
 * Send unauthorized error (401)
 *
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
function unauthorized(res, message = 'Authentication required') {
  error(res, 'unauthorized', message, 401);
}

/**
 * Send forbidden error (403)
 *
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
function forbidden(res, message = 'Access denied') {
  error(res, 'forbidden', message, 403);
}

/**
 * Send not found error (404)
 *
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name
 */
function notFound(res, resource = 'Resource') {
  error(res, 'not-found', `${resource} not found`, 404);
}

/**
 * Send conflict error (409)
 *
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
function conflict(res, message) {
  error(res, 'conflict', message, 409);
}

/**
 * Send validation error (422)
 *
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors
 */
function validationError(res, errors) {
  error(res, 'validation-error', 'Validation failed', 422, errors);
}

/**
 * Send internal server error (500)
 *
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
function serverError(res, message = 'Internal server error') {
  error(res, 'internal-error', message, 500);
}

module.exports = {
  success,
  successWithPagination,
  created,
  noContent,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  serverError,
};
