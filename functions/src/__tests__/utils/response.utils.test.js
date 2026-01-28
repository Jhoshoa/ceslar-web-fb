/**
 * Response Utilities Tests
 */

const {
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
} = require('../../utils/response.utils');

// Mock Express response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('Response Utilities', () => {
  describe('success', () => {
    it('should return success response with default status 200', () => {
      const res = mockResponse();
      const data = { id: 1, name: 'Test' };

      success(res, data);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('should return success response with custom status', () => {
      const res = mockResponse();
      const data = { id: 1 };

      success(res, data, 201);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('successWithPagination', () => {
    it('should return success response with pagination', () => {
      const res = mockResponse();
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = {
        total: 10,
        page: 1,
        limit: 2,
        totalPages: 5,
      };

      successWithPagination(res, data, pagination);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        pagination,
      });
    });
  });

  describe('created', () => {
    it('should return 201 status', () => {
      const res = mockResponse();
      const data = { id: 1, name: 'New Item' };

      created(res, data);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });
  });

  describe('noContent', () => {
    it('should return 204 status with no body', () => {
      const res = mockResponse();

      noContent(res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should return error response with default status 400', () => {
      const res = mockResponse();

      error(res, 'test-error', 'Test error message');

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'test-error',
          message: 'Test error message',
        },
      });
    });

    it('should return error response with custom status', () => {
      const res = mockResponse();

      error(res, 'test-error', 'Test error', 500);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should include details when provided', () => {
      const res = mockResponse();
      const details = { field: 'email', reason: 'invalid' };

      error(res, 'test-error', 'Test error', 400, details);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'test-error',
          message: 'Test error',
          details,
        },
      });
    });
  });

  describe('badRequest', () => {
    it('should return 400 status with bad-request code', () => {
      const res = mockResponse();

      badRequest(res, 'Invalid input');

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'bad-request',
          message: 'Invalid input',
        },
      });
    });
  });

  describe('unauthorized', () => {
    it('should return 401 status with default message', () => {
      const res = mockResponse();

      unauthorized(res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'unauthorized',
          message: 'Authentication required',
        },
      });
    });

    it('should return 401 status with custom message', () => {
      const res = mockResponse();

      unauthorized(res, 'Token expired');

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'unauthorized',
          message: 'Token expired',
        },
      });
    });
  });

  describe('forbidden', () => {
    it('should return 403 status with default message', () => {
      const res = mockResponse();

      forbidden(res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'forbidden',
          message: 'Access denied',
        },
      });
    });
  });

  describe('notFound', () => {
    it('should return 404 status with resource name', () => {
      const res = mockResponse();

      notFound(res, 'User');

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'not-found',
          message: 'User not found',
        },
      });
    });

    it('should return 404 status with default resource name', () => {
      const res = mockResponse();

      notFound(res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'not-found',
          message: 'Resource not found',
        },
      });
    });
  });

  describe('conflict', () => {
    it('should return 409 status', () => {
      const res = mockResponse();

      conflict(res, 'Email already exists');

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'conflict',
          message: 'Email already exists',
        },
      });
    });
  });

  describe('validationError', () => {
    it('should return 422 status with validation errors', () => {
      const res = mockResponse();
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' },
      ];

      validationError(res, errors);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'validation-error',
          message: 'Validation failed',
          details: errors,
        },
      });
    });
  });

  describe('serverError', () => {
    it('should return 500 status with default message', () => {
      const res = mockResponse();

      serverError(res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'internal-error',
          message: 'Internal server error',
        },
      });
    });

    it('should return 500 status with custom message', () => {
      const res = mockResponse();

      serverError(res, 'Database connection failed');

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'internal-error',
          message: 'Database connection failed',
        },
      });
    });
  });
});
