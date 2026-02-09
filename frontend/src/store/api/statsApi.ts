/**
 * Stats API
 *
 * RTK Query endpoints for public statistics.
 */

import { baseApi } from './baseApi';

/**
 * Public stats response type
 */
export interface PublicStats {
  yearsOfService: number;
  churchesCount: number;
  countriesCount: number;
  membersCount: number;
}

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const statsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get public statistics for about page
     */
    getPublicStats: builder.query<PublicStats, void>({
      query: () => '/public/stats',
      transformResponse: (response: ApiResponse<PublicStats>) => response.data,
      providesTags: ['Stats'],
      // Cache for 5 minutes since stats don't change frequently
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetPublicStatsQuery } = statsApi;
