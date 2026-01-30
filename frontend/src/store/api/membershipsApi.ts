/**
 * Memberships API - RTK Query Endpoints
 *
 * Manages church membership requests, approvals, and role management.
 */

import { baseApi, TagType } from './baseApi';
import type {
  UserChurchMembership,
  ChurchMember,
  ChurchRole,
  PaginationInfo,
} from '@ceslar/shared-types';

/**
 * Request membership params
 */
interface RequestMembershipParams {
  churchId: string;
  answers?: unknown[];
}

/**
 * Pending memberships query params
 */
interface GetPendingMembershipsParams {
  page?: number;
  limit?: number;
  churchId?: string;
}

/**
 * Pending memberships response
 */
interface PendingMembershipsResponse {
  data: ChurchMember[];
  pagination?: PaginationInfo;
}

/**
 * Membership action params (approve/reject)
 */
interface MembershipActionParams {
  churchId: string;
  userId: string;
}

/**
 * Update member role params
 */
interface UpdateMemberRoleParams {
  churchId: string;
  userId: string;
  role: ChurchRole;
}

export const membershipsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // USER QUERIES
    // ==========================================

    getMyMemberships: builder.query<UserChurchMembership[], void>({
      query: () => '/memberships/my',
      providesTags: [{ type: 'Membership' as TagType, id: 'MY' }],
      transformResponse: (response: { data: UserChurchMembership[] }) => response.data,
    }),

    // ==========================================
    // USER MUTATIONS
    // ==========================================

    requestMembership: builder.mutation<UserChurchMembership, RequestMembershipParams>({
      query: (data) => ({
        url: '/memberships/request',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Membership' as TagType, id: 'MY' }],
      transformResponse: (response: { data: UserChurchMembership }) => response.data,
    }),

    leaveChurch: builder.mutation<void, string>({
      query: (churchId) => ({
        url: `/memberships/churches/${churchId}/leave`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Membership' as TagType, id: 'MY' },
        { type: 'Church' as TagType, id: 'LIST' },
      ],
    }),

    // ==========================================
    // ADMIN QUERIES
    // ==========================================

    getPendingMemberships: builder.query<PendingMembershipsResponse, GetPendingMembershipsParams>({
      query: (params = {}) => ({
        url: '/memberships/pending',
        params: {
          page: params.page,
          limit: params.limit,
          churchId: params.churchId,
        },
      }),
      providesTags: [{ type: 'Membership' as TagType, id: 'PENDING' }],
      transformResponse: (response: PendingMembershipsResponse) => response,
    }),

    getPendingRequests: builder.query<ChurchMember[], string>({
      query: (churchId) => `/memberships/churches/${churchId}/pending`,
      providesTags: (_result, _error, churchId) => [
        { type: 'Membership' as TagType, id: `PENDING_${churchId}` },
      ],
      transformResponse: (response: { data: ChurchMember[] }) => response.data,
    }),

    // ==========================================
    // ADMIN MUTATIONS
    // ==========================================

    approveMembership: builder.mutation<void, MembershipActionParams>({
      query: ({ churchId, userId }) => ({
        url: `/memberships/churches/${churchId}/approve/${userId}`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, { churchId }) => [
        { type: 'Membership' as TagType, id: `PENDING_${churchId}` },
        { type: 'Church' as TagType, id: churchId },
      ],
    }),

    rejectMembership: builder.mutation<void, MembershipActionParams>({
      query: ({ churchId, userId }) => ({
        url: `/memberships/churches/${churchId}/reject/${userId}`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, { churchId }) => [
        { type: 'Membership' as TagType, id: `PENDING_${churchId}` },
      ],
    }),

    updateMemberRole: builder.mutation<void, UpdateMemberRoleParams>({
      query: ({ churchId, userId, role }) => ({
        url: `/memberships/churches/${churchId}/members/${userId}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: (_result, _error, { churchId }) => [
        { type: 'Church' as TagType, id: churchId },
        { type: 'Membership' as TagType, id: `PENDING_${churchId}` },
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
