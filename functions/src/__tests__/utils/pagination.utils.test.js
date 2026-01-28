/**
 * Pagination Utilities Tests
 */

const {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  parsePagination,
  buildPaginationResponse,
} = require('../../utils/pagination.utils');

describe('Pagination Utilities', () => {
  describe('Constants', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_PAGE).toBe(1);
      expect(DEFAULT_LIMIT).toBe(10);
      expect(MAX_LIMIT).toBe(100);
    });
  });

  describe('parsePagination', () => {
    it('should use default values when no query params provided', () => {
      const result = parsePagination({});

      expect(result).toEqual({
        page: 1,
        limit: 10,
        offset: 0,
      });
    });

    it('should parse page and limit from query', () => {
      const result = parsePagination({ page: '2', limit: '20' });

      expect(result).toEqual({
        page: 2,
        limit: 20,
        offset: 20,
      });
    });

    it('should calculate correct offset', () => {
      const result = parsePagination({ page: '3', limit: '15' });

      expect(result.offset).toBe(30); // (3 - 1) * 15
    });

    it('should enforce minimum page of 1', () => {
      const result = parsePagination({ page: '-5' });

      expect(result.page).toBe(1);
    });

    it('should use default limit when limit is 0 (falsy)', () => {
      const result = parsePagination({ limit: '0' });

      // 0 is falsy, so || DEFAULT_LIMIT kicks in
      expect(result.limit).toBe(DEFAULT_LIMIT);
    });

    it('should enforce minimum limit of 1 for negative values', () => {
      const result = parsePagination({ limit: '-5' });

      expect(result.limit).toBe(1);
    });

    it('should enforce maximum limit', () => {
      const result = parsePagination({ limit: '500' });

      expect(result.limit).toBe(MAX_LIMIT);
    });

    it('should handle non-numeric values', () => {
      const result = parsePagination({ page: 'abc', limit: 'xyz' });

      expect(result).toEqual({
        page: 1,
        limit: 10,
        offset: 0,
      });
    });

    it('should handle mixed valid and invalid values', () => {
      const result = parsePagination({ page: '5', limit: 'invalid' });

      expect(result).toEqual({
        page: 5,
        limit: 10,
        offset: 40,
      });
    });
  });

  describe('buildPaginationResponse', () => {
    it('should build correct pagination for first page', () => {
      const result = buildPaginationResponse(100, 1, 10);

      expect(result).toEqual({
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: false,
      });
    });

    it('should build correct pagination for middle page', () => {
      const result = buildPaginationResponse(100, 5, 10);

      expect(result).toEqual({
        total: 100,
        page: 5,
        limit: 10,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });

    it('should build correct pagination for last page', () => {
      const result = buildPaginationResponse(100, 10, 10);

      expect(result).toEqual({
        total: 100,
        page: 10,
        limit: 10,
        totalPages: 10,
        hasNextPage: false,
        hasPrevPage: true,
      });
    });

    it('should handle single page of results', () => {
      const result = buildPaginationResponse(5, 1, 10);

      expect(result).toEqual({
        total: 5,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it('should handle empty results', () => {
      const result = buildPaginationResponse(0, 1, 10);

      expect(result).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it('should calculate totalPages correctly with partial last page', () => {
      const result = buildPaginationResponse(25, 1, 10);

      expect(result.totalPages).toBe(3); // 25 items / 10 per page = 3 pages
    });

    it('should calculate totalPages correctly when exact multiple', () => {
      const result = buildPaginationResponse(30, 1, 10);

      expect(result.totalPages).toBe(3); // 30 items / 10 per page = 3 pages
    });
  });
});
