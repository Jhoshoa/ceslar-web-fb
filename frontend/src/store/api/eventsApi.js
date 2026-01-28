/**
 * Events API - RTK Query Endpoints
 *
 * Manages events, upcoming listings, and event registration.
 */

import { baseApi } from './baseApi';

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // QUERIES
    // ==========================================

    getEvents: builder.query({
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
              ...result.data.map(({ id }) => ({ type: 'Event', id })),
              { type: 'Event', id: 'LIST' },
            ]
          : [{ type: 'Event', id: 'LIST' }],
      transformResponse: (response) => ({
        data: response.data,
        pagination: response.pagination,
      }),
    }),

    getUpcomingEvents: builder.query({
      query: (params = {}) => ({
        url: '/events/upcoming',
        params: {
          limit: params.limit || 5,
          churchId: params.churchId,
        },
      }),
      providesTags: [{ type: 'Event', id: 'UPCOMING' }],
      transformResponse: (response) => response.data,
    }),

    getEventById: builder.query({
      query: (id) => `/events/${id}`,
      providesTags: (result, error, id) => [{ type: 'Event', id }],
      transformResponse: (response) => response.data,
    }),

    // ==========================================
    // MUTATIONS
    // ==========================================

    createEvent: builder.mutation({
      query: (data) => ({
        url: '/events',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Event', id: 'LIST' },
        { type: 'Event', id: 'UPCOMING' },
      ],
      transformResponse: (response) => response.data,
    }),

    updateEvent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/events/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Event', id },
        { type: 'Event', id: 'LIST' },
        { type: 'Event', id: 'UPCOMING' },
      ],
      transformResponse: (response) => response.data,
    }),

    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Event', id: 'LIST' },
        { type: 'Event', id: 'UPCOMING' },
      ],
    }),

    // ==========================================
    // REGISTRATION
    // ==========================================

    registerForEvent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/events/${id}/register`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Event', id }],
    }),

    cancelEventRegistration: builder.mutation({
      query: (id) => ({
        url: `/events/${id}/register`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Event', id }],
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
