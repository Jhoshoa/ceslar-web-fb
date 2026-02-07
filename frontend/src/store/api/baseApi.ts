/**
 * RTK Query Base API
 *
 * This module configures the base API for RTK Query with:
 * - Firebase Auth token auto-attachment
 * - Automatic token refresh on 401
 * - Tag types for cache invalidation
 * - Error handling
 */

import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { auth } from '../../config/firebase';
import type { RootState } from '../index';

// API base URL from environment
const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5001/demo-ceslar-church-platform/southamerica-east1/api';

/**
 * Tag types for RTK Query cache invalidation
 */
export const tagTypes = [
  'User',
  'Church',
  'Event',
  'Sermon',
  'Ministry',
  'Question',
  'QuestionCategory',
  'Membership',
  'PrayerRequest',
] as const;

export type TagType = (typeof tagTypes)[number];

/**
 * Base query with Firebase authentication
 */
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: async (headers, { getState }) => {
    // Get Firebase token
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        headers.set('Authorization', `Bearer ${token}`);
      } catch (error) {
        console.error('Error getting Firebase token:', error);
      }
    }

    // Set language from preferences
    const state = getState() as RootState;
    const language = state?.preferences?.language || 'es';
    headers.set('Accept-Language', language);

    return headers;
  },
});

/**
 * Base query with automatic re-authentication on 401
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQueryWithAuth(args, api, extraOptions);

  // Handle 401 - Token expired
  if (result.error && result.error.status === 401) {
    const user = auth.currentUser;

    if (user) {
      try {
        // Force refresh the token
        await user.getIdToken(true);
        // Retry the request
        result = await baseQueryWithAuth(args, api, extraOptions);
      } catch (error) {
        // Token refresh failed - sign out
        console.error('Token refresh failed:', error);
        await auth.signOut();
        api.dispatch({ type: 'auth/logout' });
      }
    }
  }

  return result;
};

/**
 * Base API configuration
 *
 * Tag Types:
 * - User: User profiles and lists
 * - Church: Churches and hierarchy
 * - Event: Events and registrations
 * - Sermon: Sermon library
 * - Ministry: Ministry information
 * - Question/QuestionCategory: Registration questions
 * - Membership: Church memberships
 * - PrayerRequest: Prayer requests
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes,
  endpoints: () => ({}),
  // Refetch settings
  refetchOnMountOrArgChange: 30, // Refetch if data is 30 seconds old
  refetchOnFocus: true, // Refetch when window regains focus
  refetchOnReconnect: true, // Refetch when network reconnects
});

export default baseApi;
