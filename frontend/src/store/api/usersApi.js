/**
 * Users API - RTK Query Endpoints
 *
 * Manages user profiles, admin user management, and role updates.
 */

import { baseApi } from './baseApi';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // CURRENT USER
    // ==========================================

    getMe: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
      transformResponse: (response) => response.data,
    }),

    updateMe: builder.mutation({
      query: (data) => ({
        url: '/users/me',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
      transformResponse: (response) => response.data,
    }),

    // ==========================================
    // ADMIN: USER MANAGEMENT
    // ==========================================

    getUsers: builder.query({
      query: (params = {}) => ({
        url: '/users',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search,
          systemRole: params.systemRole,
          isActive: params.isActive,
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'User', id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
      transformResponse: (response) => ({
        data: response.data,
        pagination: response.pagination,
      }),
    }),

    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
      transformResponse: (response) => response.data,
    }),

    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
      transformResponse: (response) => response.data,
    }),

    updateUserRole: builder.mutation({
      query: ({ id, systemRole }) => ({
        url: `/users/${id}/role`,
        method: 'PUT',
        body: { systemRole },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
      transformResponse: (response) => response.data,
    }),

    syncUser: builder.mutation({
      query: () => ({
        url: '/users/sync',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
      transformResponse: (response) => response.data,
    }),

    deactivateUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/deactivate`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    reactivateUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/reactivate`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    // ==========================================
    // CHURCH ROLES
    // ==========================================

    assignChurchRole: builder.mutation({
      query: ({ userId, churchId, role }) => ({
        url: `/users/${userId}/church-roles`,
        method: 'POST',
        body: { churchId, role },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
        { type: 'Membership', id: 'LIST' },
      ],
      transformResponse: (response) => response.data,
    }),

    updateChurchRole: builder.mutation({
      query: ({ userId, churchId, role }) => ({
        url: `/users/${userId}/church-roles/${churchId}`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
        { type: 'Membership', id: 'LIST' },
      ],
      transformResponse: (response) => response.data,
    }),

    removeChurchRole: builder.mutation({
      query: ({ userId, churchId }) => ({
        url: `/users/${userId}/church-roles/${churchId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
        { type: 'Membership', id: 'LIST' },
      ],
    }),

    // ==========================================
    // PROFILE PICTURE
    // ==========================================

    uploadAvatar: builder.mutation({
      query: ({ userId, image }) => ({
        url: `/users/${userId}/avatar`,
        method: 'POST',
        body: { image },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        'User',
      ],
      transformResponse: (response) => response.data,
    }),

    removeAvatar: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}/avatar`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
        'User',
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  // Current user
  useGetMeQuery,
  useUpdateMeMutation,
  // Admin: User management
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useSyncUserMutation,
  useDeactivateUserMutation,
  useReactivateUserMutation,
  // Church roles
  useAssignChurchRoleMutation,
  useUpdateChurchRoleMutation,
  useRemoveChurchRoleMutation,
  // Profile picture
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
} = usersApi;
