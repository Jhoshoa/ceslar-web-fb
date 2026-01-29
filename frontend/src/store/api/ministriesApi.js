/**
 * Ministries API - RTK Query Endpoints
 *
 * Manages church ministries (youth, women, men, children, worship, etc.)
 */

import { baseApi } from './baseApi';

export const ministriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // QUERIES
    // ==========================================

    getMinistries: builder.query({
      query: (params = {}) => ({
        url: '/ministries',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          churchId: params.churchId,
          type: params.type,
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Ministry', id })),
              { type: 'Ministry', id: 'LIST' },
            ]
          : [{ type: 'Ministry', id: 'LIST' }],
      transformResponse: (response) => ({
        data: response.data || [],
        pagination: response.pagination,
      }),
    }),

    getMinistryById: builder.query({
      query: (id) => `/ministries/${id}`,
      providesTags: (result, error, id) => [{ type: 'Ministry', id }],
      transformResponse: (response) => response.data,
    }),

    // ==========================================
    // MUTATIONS
    // ==========================================

    createMinistry: builder.mutation({
      query: (data) => ({
        url: '/ministries',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Ministry', id: 'LIST' }],
      transformResponse: (response) => response.data,
    }),

    updateMinistry: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/ministries/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Ministry', id },
        { type: 'Ministry', id: 'LIST' },
      ],
      transformResponse: (response) => response.data,
    }),

    deleteMinistry: builder.mutation({
      query: (id) => ({
        url: `/ministries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Ministry', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMinistriesQuery,
  useGetMinistryByIdQuery,
  useCreateMinistryMutation,
  useUpdateMinistryMutation,
  useDeleteMinistryMutation,
} = ministriesApi;
