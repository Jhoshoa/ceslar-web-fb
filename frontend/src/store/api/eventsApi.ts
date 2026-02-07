/**
 * Events API - RTK Query Endpoints
 *
 * Manages events, upcoming listings, and event registration.
 */

import { baseApi, TagType } from './baseApi';
import type {
  Event,
  EventType,
  EventStatus,
  EventCreateInput,
  EventUpdateInput,
  PaginationInfo,
} from '@ceslar/shared-types';

/**
 * Query parameters for fetching events
 */
interface GetEventsParams {
  page?: number;
  limit?: number;
  churchId?: string;
  type?: EventType;
  status?: EventStatus;
}

/**
 * Paginated events response
 */
interface PaginatedEventsResponse {
  data: Event[];
  pagination: PaginationInfo;
}

/**
 * Upcoming events params
 */
interface GetUpcomingEventsParams {
  limit?: number;
  churchId?: string;
}

/**
 * Upcoming events response
 */
interface UpcomingEventsResponse {
  data: Event[];
}

/**
 * Update event params with ID
 */
interface UpdateEventParams extends EventUpdateInput {
  id: string;
}

/**
 * Event registration params
 */
interface RegisterForEventParams {
  id: string;
  [key: string]: unknown;
}

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // QUERIES
    // ==========================================

    getEvents: builder.query<PaginatedEventsResponse, GetEventsParams>({
      query: (params = {}) => ({
        url: '/events',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          churchId: params.churchId,
          type: params.type,
          status: params.status,
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Event' as TagType, id })),
              { type: 'Event' as TagType, id: 'LIST' },
            ]
          : [{ type: 'Event' as TagType, id: 'LIST' }],
      transformResponse: (response: { data: Event[]; pagination: PaginationInfo }) => ({
        data: response.data || [],
        pagination: response.pagination,
      }),
    }),

    getUpcomingEvents: builder.query<UpcomingEventsResponse, GetUpcomingEventsParams>({
      query: (params = {}) => ({
        url: '/events/upcoming',
        params: {
          limit: params.limit || 5,
          churchId: params.churchId,
        },
      }),
      providesTags: [{ type: 'Event' as TagType, id: 'UPCOMING' }],
      transformResponse: (response: { data: Event[] }) => ({
        data: response.data || [],
      }),
    }),

    getEventById: builder.query<Event, string>({
      query: (id) => `/events/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Event' as TagType, id }],
      transformResponse: (response: { data: Event }) => response.data,
    }),

    // ==========================================
    // MUTATIONS
    // ==========================================

    createEvent: builder.mutation<Event, EventCreateInput>({
      query: (data) => ({
        url: '/events',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Event' as TagType, id: 'LIST' },
        { type: 'Event' as TagType, id: 'UPCOMING' },
      ],
      transformResponse: (response: { data: Event }) => response.data,
    }),

    updateEvent: builder.mutation<Event, UpdateEventParams>({
      query: ({ id, ...data }) => ({
        url: `/events/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Event' as TagType, id },
        { type: 'Event' as TagType, id: 'LIST' },
        { type: 'Event' as TagType, id: 'UPCOMING' },
      ],
      transformResponse: (response: { data: Event }) => response.data,
    }),

    deleteEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Event' as TagType, id: 'LIST' },
        { type: 'Event' as TagType, id: 'UPCOMING' },
      ],
    }),

    // ==========================================
    // REGISTRATION
    // ==========================================

    registerForEvent: builder.mutation<void, RegisterForEventParams>({
      query: ({ id, ...data }) => ({
        url: `/events/${id}/register`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Event' as TagType, id }],
    }),

    cancelEventRegistration: builder.mutation<void, string>({
      query: (id) => ({
        url: `/events/${id}/register`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Event' as TagType, id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetEventsQuery,
  useGetUpcomingEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useRegisterForEventMutation,
  useCancelEventRegistrationMutation,
} = eventsApi;
