/**
 * Memberships API - RTK Query Endpoints
 *
 * Manages church membership requests, approvals, and role management.
 */

import { baseApi } from './baseApi';

export const membershipsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // USER QUERIES
    // ==========================================

    getMyMemberships: builder.query({
      query: () => '/memberships/my',
      providesTags: [{ type: 'Membership', id: 'MY' }],
      transformResponse: (response) => response.data,
    }),

    // ==========================================
    // USER MUTATIONS
    // ==========================================

    requestMembership: builder.mutation({
      query: (data) => ({
        url: '/memberships/request',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Membership', id: 'MY' }],
      transformResponse: (response) => response.data,
    }),

    leaveChurch: builder.mutation({
      query: (churchId) => ({
        url: `/memberships/churches/${churchId}/leave`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Membership', id: 'MY' },
        { type: 'Church', id: 'LIST' },
      ],
    }),

    // ==========================================
    // ADMIN QUERIES
    // ==========================================

    getPendingMemberships: builder.query({
      query: (params = {}) => ({
        url: '/memberships/pending',
        params: {
          page: params.page,
          limit: params.limit,
          churchId: params.churchId,
        },
      }),
      providesTags: [{ type: 'Membership', id: 'PENDING' }],
      transformResponse: (response) => response,
    }),

    getPendingRequests: builder.query({
      query: (churchId) => `/memberships/churches/${churchId}/pending`,
      providesTags: (result, error, churchId) => [
        { type: 'Membership', id: `PENDING_${churchId}` },
      ],
      transformResponse: (response) => response.data,
    }),

    // ==========================================
    // ADMIN MUTATIONS
    // ==========================================

    approveMembership: builder.mutation({
      query: ({ churchId, userId }) => ({
        url: `/memberships/churches/${churchId}/approve/${userId}`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, { churchId }) => [
        { type: 'Membership', id: `PENDING_${churchId}` },
        { type: 'Church', id: churchId },
      ],
    }),

    rejectMembership: builder.mutation({
      query: ({ churchId, userId }) => ({
        url: `/memberships/churches/${churchId}/reject/${userId}`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, { churchId }) => [
        { type: 'Membership', id: `PENDING_${churchId}` },
      ],
    }),

    updateMemberRole: builder.mutation({
      query: ({ churchId, userId, role }) => ({
        url: `/memberships/churches/${churchId}/members/${userId}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: (result, error, { churchId }) => [
        { type: 'Church', id: churchId },
        { type: 'Membership', id: `PENDING_${churchId}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyMembershipsQuery,
  useRequestMembershipMutation,
  useLeaveChurchMutation,
  useGetPendingMembershipsQuery,
  useGetPendingRequestsQuery,
  useApproveMembershipMutation,
  useRejectMembershipMutation,
  useUpdateMemberRoleMutation,
} = membershipsApi;
