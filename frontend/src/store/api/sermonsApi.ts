/**
 * Sermons API - RTK Query Endpoints
 *
 * Manages sermon library, featured/latest listings, and view tracking.
 */

import { baseApi, TagType } from './baseApi';
import type {
  Sermon,
  SermonCategory,
  SermonCreateInput,
  SermonUpdateInput,
  PaginationInfo,
} from '@ceslar/shared-types';

/**
 * Query parameters for fetching sermons
 */
interface GetSermonsParams {
  page?: number;
  limit?: number;
  churchId?: string;
  category?: SermonCategory;
  search?: string;
  sort?: string;
}

/**
 * Paginated sermons response
 */
interface PaginatedSermonsResponse {
  data: Sermon[];
  pagination: PaginationInfo;
}

/**
 * Latest sermons params
 */
interface GetLatestSermonsParams {
  limit?: number;
  churchId?: string;
}

/**
 * Sermons list response
 */
interface SermonsListResponse {
  data: Sermon[];
}

/**
 * Update sermon params with ID
 */
interface UpdateSermonParams extends SermonUpdateInput {
  id: string;
}

export const sermonsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // QUERIES
    // ==========================================

    getSermons: builder.query<PaginatedSermonsResponse, GetSermonsParams>({
      query: (params = {}) => ({
        url: '/sermons',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          churchId: params.churchId,
          category: params.category,
          search: params.search,
          sort: params.sort,
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Sermon' as TagType, id })),
              { type: 'Sermon' as TagType, id: 'LIST' },
            ]
          : [{ type: 'Sermon' as TagType, id: 'LIST' }],
      transformResponse: (response: { data: Sermon[]; pagination: PaginationInfo }) => ({
        data: response.data || [],
        pagination: response.pagination,
      }),
    }),

    getLatestSermons: builder.query<SermonsListResponse, GetLatestSermonsParams>({
      query: (params = {}) => ({
        url: '/sermons/latest',
        params: {
          limit: params.limit || 3,
          churchId: params.churchId,
        },
      }),
      providesTags: [{ type: 'Sermon' as TagType, id: 'LATEST' }],
      transformResponse: (response: { data: Sermon[] }) => ({
        data: response.data || [],
      }),
    }),

    getFeaturedSermons: builder.query<SermonsListResponse, number>({
      query: (limit = 3) => ({
        url: '/sermons/featured',
        params: { limit },
      }),
      providesTags: [{ type: 'Sermon' as TagType, id: 'FEATURED' }],
      transformResponse: (response: { data: Sermon[] }) => ({
        data: response.data || [],
      }),
    }),

    getSermonById: builder.query<Sermon, string>({
      query: (id) => `/sermons/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Sermon' as TagType, id }],
      transformResponse: (response: { data: Sermon }) => response.data,
    }),

    // ==========================================
    // MUTATIONS
    // ==========================================

    createSermon: builder.mutation<Sermon, SermonCreateInput>({
      query: (data) => ({
        url: '/sermons',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Sermon' as TagType, id: 'LIST' },
        { type: 'Sermon' as TagType, id: 'LATEST' },
      ],
      transformResponse: (response: { data: Sermon }) => response.data,
    }),

    updateSermon: builder.mutation<Sermon, UpdateSermonParams>({
      query: ({ id, ...data }) => ({
        url: `/sermons/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Sermon' as TagType, id },
        { type: 'Sermon' as TagType, id: 'LIST' },
        { type: 'Sermon' as TagType, id: 'LATEST' },
        { type: 'Sermon' as TagType, id: 'FEATURED' },
      ],
      transformResponse: (response: { data: Sermon }) => response.data,
    }),

    deleteSermon: builder.mutation<void, string>({
      query: (id) => ({
        url: `/sermons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Sermon' as TagType, id: 'LIST' },
        { type: 'Sermon' as TagType, id: 'LATEST' },
        { type: 'Sermon' as TagType, id: 'FEATURED' },
      ],
    }),

    // ==========================================
    // VIEW TRACKING
    // ==========================================

    incrementSermonViews: builder.mutation<void, string>({
      query: (id) => ({
        url: `/sermons/${id}/views`,
        method: 'POST',
      }),
      // Optimistic update: increment viewCount locally
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          sermonsApi.util.updateQueryData('getSermonById', id, (draft) => {
            if (draft) {
              draft.viewCount = (draft.viewCount || 0) + 1;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSermonsQuery,
  useGetLatestSermonsQuery,
  useGetFeaturedSermonsQuery,
  useGetSermonByIdQuery,
  useCreateSermonMutation,
  useUpdateSermonMutation,
  useDeleteSermonMutation,
  useIncrementSermonViewsMutation,
} = sermonsApi;
