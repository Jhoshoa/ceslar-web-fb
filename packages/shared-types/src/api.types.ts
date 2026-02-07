/**
 * API Types
 *
 * Types for API requests, responses, and error handling.
 */

// ============================================
// PAGINATION
// ============================================

/**
 * Pagination information returned with list responses
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Pagination parameters for requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ============================================
// API RESPONSES
// ============================================

/**
 * Base API response structure
 */
export interface ApiResponseBase {
  success: boolean;
  message?: string;
  timestamp?: string;
}

/**
 * Successful API response with single data item
 */
export interface ApiResponse<T> extends ApiResponseBase {
  success: true;
  data: T;
}

/**
 * Successful API response with paginated list
 */
export interface PaginatedApiResponse<T> extends ApiResponseBase {
  success: true;
  data: T[];
  pagination: PaginationInfo;
}

/**
 * Successful API response for mutations (create/update/delete)
 */
export interface ApiMutationResponse<T = void> extends ApiResponseBase {
  success: true;
  data: T;
  message: string;
}

/**
 * Empty success response (for deletes)
 */
export interface ApiEmptyResponse extends ApiResponseBase {
  success: true;
  message: string;
}

// ============================================
// API ERRORS
// ============================================

/**
 * API error codes
 */
export type ApiErrorCode =
  // Authentication errors
  | 'AUTH_REQUIRED'
  | 'AUTH_INVALID_TOKEN'
  | 'AUTH_TOKEN_EXPIRED'
  | 'AUTH_INSUFFICIENT_PERMISSIONS'
  // Validation errors
  | 'VALIDATION_ERROR'
  | 'INVALID_INPUT'
  | 'MISSING_REQUIRED_FIELD'
  // Resource errors
  | 'NOT_FOUND'
  | 'ALREADY_EXISTS'
  | 'CONFLICT'
  // Rate limiting
  | 'RATE_LIMIT_EXCEEDED'
  // Server errors
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  // Custom errors
  | 'CHURCH_NOT_FOUND'
  | 'USER_NOT_FOUND'
  | 'EVENT_NOT_FOUND'
  | 'SERMON_NOT_FOUND'
  | 'MINISTRY_NOT_FOUND'
  | 'QUESTION_NOT_FOUND'
  | 'MEMBERSHIP_EXISTS'
  | 'EVENT_FULL'
  | 'REGISTRATION_CLOSED';

/**
 * API error details
 */
export interface ApiErrorDetails {
  code: ApiErrorCode;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

/**
 * API error response
 */
export interface ApiErrorResponse extends ApiResponseBase {
  success: false;
  error: ApiErrorDetails;
}

/**
 * Validation error with field-level details
 */
export interface ValidationErrorResponse extends ApiResponseBase {
  success: false;
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    fields: Record<string, string[]>;  // { fieldName: ['error1', 'error2'] }
  };
}

// ============================================
// REQUEST TYPES
// ============================================

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Base query parameters
 */
export interface BaseQueryParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
}

/**
 * ID parameter for single resource requests
 */
export interface IdParam {
  id: string;
}

/**
 * Slug parameter for resource lookup
 */
export interface SlugParam {
  slug: string;
}

// ============================================
// RTK QUERY HELPERS
// ============================================

/**
 * Tag types for RTK Query cache invalidation
 */
export type TagType =
  | 'User'
  | 'Church'
  | 'Event'
  | 'Sermon'
  | 'Ministry'
  | 'Question'
  | 'QuestionCategory'
  | 'Membership'
  | 'PrayerRequest';

/**
 * RTK Query tag with ID
 */
export interface Tag {
  type: TagType;
  id: string | 'LIST' | 'FEATURED' | 'GROUPED';
}

/**
 * Transform response helper type
 */
export type ExtractData<T> = T extends ApiResponse<infer U> ? U : never;
export type ExtractPaginatedData<T> = T extends PaginatedApiResponse<infer U> ? U : never;

// ============================================
// HTTP TYPES
// ============================================

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * HTTP status codes
 */
export type HttpStatusCode =
  | 200  // OK
  | 201  // Created
  | 204  // No Content
  | 400  // Bad Request
  | 401  // Unauthorized
  | 403  // Forbidden
  | 404  // Not Found
  | 409  // Conflict
  | 422  // Unprocessable Entity
  | 429  // Too Many Requests
  | 500  // Internal Server Error
  | 503; // Service Unavailable

// ============================================
// REQUEST CONTEXT
// ============================================

/**
 * Authenticated request context
 */
export interface RequestContext {
  userId: string;
  email: string;
  systemRole: string;
  churchRoles: Record<string, string>;
  permissions: string[];
}

/**
 * Express request with auth context (for backend)
 */
export interface AuthenticatedRequest {
  user: RequestContext;
  params: Record<string, string>;
  query: Record<string, string | string[] | undefined>;
  body: unknown;
}
