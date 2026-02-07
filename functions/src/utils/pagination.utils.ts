/**
 * Pagination Utilities
 *
 * Helpers for paginating Firestore queries.
 */

import {
  CollectionReference,
  Query,
  DocumentSnapshot,
  DocumentData,
} from 'firebase-admin/firestore';
import { PaginationInfo } from '@ceslar/shared-types';

/**
 * Default pagination options
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

/**
 * Parsed pagination options
 */
export interface ParsedPagination {
  page: number;
  limit: number;
  offset: number;
}

/**
 * Order by configuration
 */
export interface OrderByConfig {
  field: string;
  direction?: 'asc' | 'desc';
}

/**
 * Filter value with operator
 */
export interface FilterWithOperator {
  operator: FirebaseFirestore.WhereFilterOp;
  value: unknown;
}

/**
 * Query options for paginated results
 */
export interface PaginatedQueryOptions {
  filters?: Record<string, unknown | unknown[] | FilterWithOperator>;
  orderBy?: OrderByConfig[];
  page?: number;
  limit?: number;
}

/**
 * Paginated results response
 */
export interface PaginatedResults<T> {
  data: T[];
  pagination: PaginationInfo;
}

/**
 * Cursor pagination options
 */
export interface CursorPaginationOptions {
  filters?: Record<string, unknown>;
  orderBy?: OrderByConfig[];
  limit?: number;
  cursor?: string | null;
}

/**
 * Cursor pagination response
 */
export interface CursorPaginatedResults<T> {
  data: T[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
}

/**
 * Parse pagination parameters from request
 */
export function parsePagination(query: Record<string, string | undefined>): ParsedPagination {
  let page = parseInt(query.page || '', 10) || DEFAULT_PAGE;
  let limit = parseInt(query.limit || '', 10) || DEFAULT_LIMIT;

  // Validate bounds
  page = Math.max(1, page);
  limit = Math.min(Math.max(1, limit), MAX_LIMIT);

  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
}

/**
 * Build pagination response object
 */
export function buildPaginationResponse(
  total: number,
  page: number,
  limit: number
): PaginationInfo {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Apply pagination to a Firestore query
 *
 * Note: Firestore doesn't support offset-based pagination efficiently.
 * For large datasets, use cursor-based pagination instead.
 */
export function applyPaginationToQuery<T extends DocumentData>(
  query: Query<T>,
  limit: number,
  startAfter: DocumentSnapshot<T> | null = null
): Query<T> {
  let paginatedQuery = query.limit(limit);

  if (startAfter) {
    paginatedQuery = paginatedQuery.startAfter(startAfter);
  }

  return paginatedQuery;
}

/**
 * Get paginated results from Firestore
 */
export async function getPaginatedResults<T extends DocumentData>(
  collection: CollectionReference<T>,
  options: PaginatedQueryOptions = {}
): Promise<PaginatedResults<T & { id: string }>> {
  const {
    filters = {},
    orderBy = [{ field: 'createdAt', direction: 'desc' }],
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
  } = options;

  // Build query with filters
  let query: Query<T> = collection;

  // Apply filters
  Object.entries(filters).forEach(([field, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        query = query.where(field, 'in', value);
      } else if (typeof value === 'object' && value !== null && 'operator' in value) {
        const filterValue = value as FilterWithOperator;
        query = query.where(field, filterValue.operator, filterValue.value);
      } else {
        query = query.where(field, '==', value);
      }
    }
  });

  // Apply ordering
  orderBy.forEach(({ field, direction = 'asc' }) => {
    query = query.orderBy(field, direction);
  });

  // Get total count (note: this requires an extra read)
  const countSnapshot = await query.count().get();
  const total = countSnapshot.data().count;

  // Apply pagination
  const offset = (page - 1) * limit;

  // For offset-based pagination, we need to skip documents
  if (offset > 0) {
    const offsetQuery = await query.limit(offset).get();
    if (!offsetQuery.empty) {
      const lastDoc = offsetQuery.docs[offsetQuery.docs.length - 1];
      query = query.startAfter(lastDoc);
    }
  }

  // Get the page of results
  const snapshot = await query.limit(limit).get();

  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as (T & { id: string })[];

  const pagination = buildPaginationResponse(total, page, limit);

  return { data, pagination };
}

/**
 * Get cursor-based paginated results (more efficient for large datasets)
 */
export async function getCursorPaginatedResults<T extends DocumentData>(
  collection: CollectionReference<T>,
  options: CursorPaginationOptions = {}
): Promise<CursorPaginatedResults<T & { id: string }>> {
  const {
    filters = {},
    orderBy = [{ field: 'createdAt', direction: 'desc' }],
    limit = DEFAULT_LIMIT,
    cursor = null,
  } = options;

  // Build query with filters
  let query: Query<T> = collection;

  Object.entries(filters).forEach(([field, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query = query.where(field, '==', value);
    }
  });

  // Apply ordering
  orderBy.forEach(({ field, direction = 'asc' }) => {
    query = query.orderBy(field, direction);
  });

  // Apply cursor
  if (cursor) {
    const cursorDoc = await collection.doc(cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  // Get results (fetch one extra to check if there's a next page)
  const snapshot = await query.limit(limit + 1).get();

  const hasMore = snapshot.docs.length > limit;
  const docs = hasMore ? snapshot.docs.slice(0, limit) : snapshot.docs;

  const data = docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as (T & { id: string })[];

  const nextCursor = hasMore ? docs[docs.length - 1].id : null;

  return {
    data,
    pagination: {
      limit,
      hasMore,
      nextCursor,
    },
  };
}
