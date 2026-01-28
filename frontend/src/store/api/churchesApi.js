/**
 * Churches API - RTK Query Endpoints
 *
 * Manages church hierarchy, leadership, and location-based queries.
 */

import { baseApi } from './baseApi';

export const churchesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // PUBLIC QUERIES
    // ==========================================

    getChurches: builder.query({
      query: (params = {}) => ({
        url: '/churches',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          country: params.country,
          department: params.department,
          city: params.city,
          level: params.level,
          status: params.status,
          search: params.search,
          parentChurchId: params.parentChurchId,
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Church', id })),
              { type: 'Church', id: 'LIST' },
            ]
          : [{ type: 'Church', id: 'LIST' }],
      transformResponse: (response) => ({
        data: response.data,
        pagination: response.pagination,
      }),
    }),

    getChurchById: builder.query({
      query: (id) => `/churches/${id}`,
      providesTags: (result, error, id) => [{ type: 'Church', id }],
      transformResponse: (response) => response.data,
    }),

    getChurchBySlug: builder.query({
      query: (slug) => `/churches/slug/${slug}`,
      providesTags: (result) =>
        result ? [{ type: 'Church', id: result.id }] : [],
      transformResponse: (response) => response.data,
    }),

    getFeaturedChurches: builder.query({
      query: (limit = 4) => ({
        url: '/churches/featured',
        params: { limit },
      }),
      providesTags: [{ type: 'Church', id: 'FEATURED' }],
      transformResponse: (response) => response.data,
    }),

    getHeadquarters: builder.query({
      query: () => '/churches/headquarters',
      providesTags: [{ type: 'Church', id: 'HQ' }],
      transformResponse: (response) => response.data,
    }),

    getChurchesGrouped: builder.query({
      query: () => '/churches/grouped',
      providesTags: [{ type: 'Church', id: 'GROUPED' }],
      transformResponse: (response) => response.data,
    }),

    getCountries: builder.query({
      query: () => '/churches/countries',
      providesTags: [{ type: 'Church', id: 'COUNTRIES' }],
      transformResponse: (response) => response.data,
    }),

    getDepartmentsByCountry: builder.query({
      query: (country) => `/churches/countries/${encodeURIComponent(country)}/departments`,
      transformResponse: (response) => response.data,
    }),

    // ==========================================
    // ADMIN MUTATIONS
    // ==========================================

    createChurch: builder.mutation({
      query: (data) => ({
        url: '/churches',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Church', id: 'LIST' },
        { type: 'Church', id: 'GROUPED' },
        { type: 'Church', id: 'COUNTRIES' },
      ],
      transformResponse: (response) => response.data,
    }),

    updateChurch: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/churches/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Church', id },
        { type: 'Church', id: 'LIST' },
        { type: 'Church', id: 'FEATURED' },
        { type: 'Church', id: 'GROUPED' },
      ],
      transformResponse: (response) => response.data,
    }),

    deleteChurch: builder.mutation({
      query: (id) => ({
        url: `/churches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Church', id: 'LIST' },
        { type: 'Church', id: 'GROUPED' },
        { type: 'Church', id: 'COUNTRIES' },
      ],
    }),

    // ==========================================
    // LEADERSHIP
    // ==========================================

    addLeadership: builder.mutation({
      query: ({ churchId, ...data }) => ({
        url: `/churches/${churchId}/leadership`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { churchId }) => [
        { type: 'Church', id: churchId },
      ],
      transformResponse: (response) => response.data,
    }),

    removeLeadership: builder.mutation({
      query: ({ churchId, leadershipId }) => ({
        url: `/churches/${churchId}/leadership/${leadershipId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { churchId }) => [
        { type: 'Church', id: churchId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetChurchesQuery,
  useGetChurchByIdQuery,
  useGetChurchBySlugQuery,
  useGetFeaturedChurchesQuery,
  useGetHeadquartersQuery,
  useGetChurchesGroupedQuery,
  useGetCountriesQuery,
  useGetDepartmentsByCountryQuery,
  useCreateChurchMutation,
  useUpdateChurchMutation,
  useDeleteChurchMutation,
  useAddLeadershipMutation,
  useRemoveLeadershipMutation,
} = churchesApi;
