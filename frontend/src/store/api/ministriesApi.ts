/**
 * Ministries API - RTK Query Endpoints
 *
 * Manages church ministries (youth, women, men, children, worship, etc.)
 */

import { baseApi, TagType } from './baseApi';
import type {
  Ministry,
  MinistryType,
  MinistryCreateInput,
  MinistryUpdateInput,
  PaginationInfo,
} from '@ceslar/shared-types';

/**
 * Query parameters for fetching ministries
 */
interface GetMinistriesParams {
  page?: number;
  limit?: number;
  churchId?: string;
  type?: MinistryType;
}

/**
 * Paginated ministries response
 */
interface PaginatedMinistriesResponse {
  data: Ministry[];
  pagination: PaginationInfo;
}

/**
 * Update ministry params with ID
 */
interface UpdateMinistryParams extends MinistryUpdateInput {
  id: string;
}

export const ministriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // QUERIES
    // ==========================================

    getMinistries: builder.query<PaginatedMinistriesResponse, GetMinistriesParams>({
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
              ...result.data.map(({ id }) => ({ type: 'Ministry' as TagType, id })),
              { type: 'Ministry' as TagType, id: 'LIST' },
            ]
          : [{ type: 'Ministry' as TagType, id: 'LIST' }],
      transformResponse: (response: { data: Ministry[]; pagination: PaginationInfo }) => ({
        data: response.data || [],
        pagination: response.pagination,
      }),
    }),

    getMinistryById: builder.query<Ministry, string>({
      query: (id) => `/ministries/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Ministry' as TagType, id }],
      transformResponse: (response: { data: Ministry }) => response.data,
    }),

    // ==========================================
    // MUTATIONS
    // ==========================================

    createMinistry: builder.mutation<Ministry, MinistryCreateInput>({
      query: (data) => ({
        url: '/ministries',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Ministry' as TagType, id: 'LIST' }],
      transformResponse: (response: { data: Ministry }) => response.data,
    }),

    updateMinistry: builder.mutation<Ministry, UpdateMinistryParams>({
      query: ({ id, ...data }) => ({
        url: `/ministries/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Ministry' as TagType, id },
        { type: 'Ministry' as TagType, id: 'LIST' },
      ],
      transformResponse: (response: { data: Ministry }) => response.data,
    }),

    deleteMinistry: builder.mutation<void, string>({
      query: (id) => ({
        url: `/ministries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Ministry' as TagType, id: 'LIST' }],
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
