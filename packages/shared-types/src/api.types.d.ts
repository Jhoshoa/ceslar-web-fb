/**
 * API Types
 *
 * Types for API requests, responses, and error handling.
 */
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
/**
 * API error codes
 */
export type ApiErrorCode = 'AUTH_REQUIRED' | 'AUTH_INVALID_TOKEN' | 'AUTH_TOKEN_EXPIRED' | 'AUTH_INSUFFICIENT_PERMISSIONS' | 'VALIDATION_ERROR' | 'INVALID_INPUT' | 'MISSING_REQUIRED_FIELD' | 'NOT_FOUND' | 'ALREADY_EXISTS' | 'CONFLICT' | 'RATE_LIMIT_EXCEEDED' | 'INTERNAL_ERROR' | 'SERVICE_UNAVAILABLE' | 'CHURCH_NOT_FOUND' | 'USER_NOT_FOUND' | 'EVENT_NOT_FOUND' | 'SERMON_NOT_FOUND' | 'MINISTRY_NOT_FOUND' | 'QUESTION_NOT_FOUND' | 'MEMBERSHIP_EXISTS' | 'EVENT_FULL' | 'REGISTRATION_CLOSED';
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
        fields: Record<string, string[]>;
    };
}
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
/**
 * Tag types for RTK Query cache invalidation
 */
export type TagType = 'User' | 'Church' | 'Event' | 'Sermon' | 'Ministry' | 'Question' | 'QuestionCategory' | 'Membership' | 'PrayerRequest';
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
/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
/**
 * HTTP status codes
 */
export type HttpStatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 503;
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
//# sourceMappingURL=api.types.d.ts.map