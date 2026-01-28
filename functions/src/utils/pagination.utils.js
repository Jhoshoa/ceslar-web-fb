/**
 * Pagination Utilities
 *
 * Helpers for paginating Firestore queries.
 */

/**
 * Default pagination options
 */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Parse pagination parameters from request
 *
 * @param {Object} query - Request query parameters
 * @returns {Object} Parsed pagination options
 */
function parsePagination(query) {
  let page = parseInt(query.page, 10) || DEFAULT_PAGE;
  let limit = parseInt(query.limit, 10) || DEFAULT_LIMIT;

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
 *
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
function buildPaginationResponse(total, page, limit) {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Apply pagination to a Firestore query
 *
 * Note: Firestore doesn't support offset-based pagination efficiently.
 * For large datasets, use cursor-based pagination instead.
 *
 * @param {Query} query - Firestore query
 * @param {number} limit - Number of items to fetch
 * @param {DocumentSnapshot} startAfter - Last document from previous page
 * @returns {Query} Paginated query
 */
function applyPaginationToQuery(query, limit, startAfter = null) {
  let paginatedQuery = query.limit(limit);

  if (startAfter) {
    paginatedQuery = paginatedQuery.startAfter(startAfter);
  }

  return paginatedQuery;
}

/**
 * Get paginated results from Firestore
 *
 * @param {CollectionReference} collection - Firestore collection reference
 * @param {Object} options - Query options
 * @param {Object} options.filters - Filter conditions
 * @param {Array} options.orderBy - Order by fields [{field, direction}]
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @returns {Promise<Object>} Paginated results with data and pagination info
 */
async function getPaginatedResults(collection, options = {}) {
  const {
    filters = {},
    orderBy = [{ field: 'createdAt', direction: 'desc' }],
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
  } = options;

  // Build query with filters
  let query = collection;

  // Apply filters
  Object.entries(filters).forEach(([field, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        query = query.where(field, 'in', value);
      } else if (typeof value === 'object' && value.operator) {
        query = query.where(field, value.operator, value.value);
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
  // For large collections, consider maintaining a counter document
  const countSnapshot = await query.count().get();
  const total = countSnapshot.data().count;

  // Apply pagination
  const offset = (page - 1) * limit;

  // For offset-based pagination, we need to skip documents
  // This is inefficient for large offsets
  if (offset > 0) {
    // Get documents up to the offset
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
  }));

  const pagination = buildPaginationResponse(total, page, limit);

  return { data, pagination };
}

/**
 * Get cursor-based paginated results (more efficient for large datasets)
 *
 * @param {CollectionReference} collection - Firestore collection reference
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results with cursor for next page
 */
async function getCursorPaginatedResults(collection, options = {}) {
  const {
    filters = {},
    orderBy = [{ field: 'createdAt', direction: 'desc' }],
    limit = DEFAULT_LIMIT,
    cursor = null, // Document ID or data to start after
  } = options;

  // Build query with filters
  let query = collection;

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
  }));

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

module.exports = {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  parsePagination,
  buildPaginationResponse,
  applyPaginationToQuery,
  getPaginatedResults,
  getCursorPaginatedResults,
};
