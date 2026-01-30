/**
 * Churches API - RTK Query Endpoints
 *
 * Manages church hierarchy, leadership, and location-based queries.
 */

import { baseApi, TagType } from './baseApi';
import type {
  Church,
  ChurchLevel,
  ChurchStatus,
  ChurchCreateInput,
  ChurchUpdateInput,
  ChurchLeadership,
  PaginationInfo,
} from '@ceslar/shared-types';

/**
 * Query parameters for fetching churches
 */
interface GetChurchesParams {
  page?: number;
  limit?: number;
  country?: string;
  department?: string;
  city?: string;
  level?: ChurchLevel;
  status?: ChurchStatus;
  search?: string;
  parentChurchId?: string;
}

/**
 * Paginated churches response
 */
interface PaginatedChurchesResponse {
  data: Church[];
  pagination: PaginationInfo;
}

/**
 * Countries response
 */
interface CountriesResponse {
  data: string[];
}

/**
 * Featured churches response
 */
interface FeaturedChurchesResponse {
  data: Church[];
}

/**
 * Leadership input
 */
interface AddLeadershipInput {
  churchId: string;
  userId?: string;
  displayName: string;
  role: string;
  title?: Record<string, string>;
  photoURL?: string;
  bio?: Record<string, string>;
  order?: number;
}

/**
 * Update church input with ID
 */
interface UpdateChurchParams extends ChurchUpdateInput {
  id: string;
}

export const churchesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // PUBLIC QUERIES (no auth required for GET)
    // ==========================================

    getChurches: builder.query<PaginatedChurchesResponse, GetChurchesParams>({
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
              ...result.data.map(({ id }) => ({ type: 'Church' as TagType, id })),
              { type: 'Church' as TagType, id: 'LIST' },
            ]
          : [{ type: 'Church' as TagType, id: 'LIST' }],
      transformResponse: (response: { data: Church[]; pagination: PaginationInfo }) => ({
        data: response.data || [],
        pagination: response.pagination,
      }),
    }),

    getChurchById: builder.query<Church, string>({
      query: (id) => `/churches/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Church' as TagType, id }],
      transformResponse: (response: { data: Church }) => response.data,
    }),

    getChurchBySlug: builder.query<Church, string>({
      query: (slug) => `/churches/slug/${slug}`,
      providesTags: (result) =>
        result ? [{ type: 'Church' as TagType, id: result.id }] : [],
      transformResponse: (response: { data: Church }) => response.data,
    }),

    getFeaturedChurches: builder.query<FeaturedChurchesResponse, { limit?: number }>({
      query: (params = {}) => ({
        url: '/churches/featured',
        params: { limit: params.limit || 4 },
      }),
      providesTags: [{ type: 'Church' as TagType, id: 'FEATURED' }],
      transformResponse: (response: { data: Church[] }) => ({
        data: response.data || [],
      }),
    }),

    getHeadquarters: builder.query<Church, void>({
      query: () => '/churches/headquarters',
      providesTags: [{ type: 'Church' as TagType, id: 'HQ' }],
      transformResponse: (response: { data: Church }) => response.data,
    }),

    getChurchesGrouped: builder.query<Record<string, Church[]>, void>({
      query: () => '/churches/grouped',
      providesTags: [{ type: 'Church' as TagType, id: 'GROUPED' }],
      transformResponse: (response: { data: Record<string, Church[]> }) => response.data,
    }),

    getCountries: builder.query<CountriesResponse, void>({
      query: () => '/churches/countries',
      providesTags: [{ type: 'Church' as TagType, id: 'COUNTRIES' }],
      transformResponse: (response: { data: string[] }) => ({
        data: response.data || [],
      }),
    }),

    getDepartmentsByCountry: builder.query<string[], string>({
      query: (country) =>
        `/churches/countries/${encodeURIComponent(country)}/departments`,
      transformResponse: (response: { data: string[] }) => response.data,
    }),

    // ==========================================
    // ADMIN MUTATIONS
    // ==========================================

    createChurch: builder.mutation<Church, ChurchCreateInput>({
      query: (data) => ({
        url: '/churches',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Church' as TagType, id: 'LIST' },
        { type: 'Church' as TagType, id: 'GROUPED' },
        { type: 'Church' as TagType, id: 'COUNTRIES' },
      ],
      transformResponse: (response: { data: Church }) => response.data,
    }),

    updateChurch: builder.mutation<Church, UpdateChurchParams>({
      query: ({ id, ...data }) => ({
        url: `/churches/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Church' as TagType, id },
        { type: 'Church' as TagType, id: 'LIST' },
        { type: 'Church' as TagType, id: 'FEATURED' },
        { type: 'Church' as TagType, id: 'GROUPED' },
      ],
      transformResponse: (response: { data: Church }) => response.data,
    }),

    deleteChurch: builder.mutation<void, string>({
      query: (id) => ({
        url: `/churches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Church' as TagType, id: 'LIST' },
        { type: 'Church' as TagType, id: 'GROUPED' },
        { type: 'Church' as TagType, id: 'COUNTRIES' },
      ],
    }),

    // ==========================================
    // LEADERSHIP
    // ==========================================

    addLeadership: builder.mutation<ChurchLeadership, AddLeadershipInput>({
      query: ({ churchId, ...data }) => ({
        url: `/churches/${churchId}/leadership`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { churchId }) => [
        { type: 'Church' as TagType, id: churchId },
      ],
      transformResponse: (response: { data: ChurchLeadership }) => response.data,
    }),

    removeLeadership: builder.mutation<void, { churchId: string; leadershipId: string }>({
      query: ({ churchId, leadershipId }) => ({
        url: `/churches/${churchId}/leadership/${leadershipId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { churchId }) => [
        { type: 'Church' as TagType, id: churchId },
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
