/**
 * Sermons API - RTK Query Endpoints
 *
 * Manages sermon library, featured/latest listings, and view tracking.
 */

import { baseApi } from './baseApi';

export const sermonsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // QUERIES
    // ==========================================

    getSermons: builder.query({
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
              ...result.data.map(({ id }) => ({ type: 'Sermon', id })),
              { type: 'Sermon', id: 'LIST' },
            ]
          : [{ type: 'Sermon', id: 'LIST' }],
      transformResponse: (response) => ({
        data: response.data || [],
        pagination: response.pagination,
      }),
    }),

    getLatestSermons: builder.query({
      query: (params = {}) => ({
        url: '/sermons/latest',
        params: {
          limit: params.limit || 3,
          churchId: params.churchId,
        },
      }),
      providesTags: [{ type: 'Sermon', id: 'LATEST' }],
      transformResponse: (response) => ({
        data: response.data || [],
      }),
    }),

    getFeaturedSermons: builder.query({
      query: (limit = 3) => ({
        url: '/sermons/featured',
        params: { limit },
      }),
      providesTags: [{ type: 'Sermon', id: 'FEATURED' }],
      transformResponse: (response) => ({
        data: response.data || [],
      }),
    }),

    getSermonById: builder.query({
      query: (id) => `/sermons/${id}`,
      providesTags: (result, error, id) => [{ type: 'Sermon', id }],
      transformResponse: (response) => response.data,
    }),

    // ==========================================
    // MUTATIONS
    // ==========================================

    createSermon: builder.mutation({
      query: (data) => ({
        url: '/sermons',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Sermon', id: 'LIST' },
        { type: 'Sermon', id: 'LATEST' },
      ],
      transformResponse: (response) => response.data,
    }),

    updateSermon: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/sermons/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Sermon', id },
        { type: 'Sermon', id: 'LIST' },
        { type: 'Sermon', id: 'LATEST' },
        { type: 'Sermon', id: 'FEATURED' },
      ],
      transformResponse: (response) => response.data,
    }),

    deleteSermon: builder.mutation({
      query: (id) => ({
        url: `/sermons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Sermon', id: 'LIST' },
        { type: 'Sermon', id: 'LATEST' },
        { type: 'Sermon', id: 'FEATURED' },
      ],
    }),

    // ==========================================
    // VIEW TRACKING
    // ==========================================

    incrementSermonViews: builder.mutation({
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
          }),
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
