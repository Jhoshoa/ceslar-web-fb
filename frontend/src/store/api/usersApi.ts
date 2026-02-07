/**
 * Users API - RTK Query Endpoints
 *
 * Manages user profiles, admin user management, and role updates.
 */

import { baseApi, TagType } from './baseApi';
import type {
  User,
  UserUpdateInput,
  SystemRole,
  ChurchRole,
  PaginationInfo,
} from '@ceslar/shared-types';

/**
 * Query parameters for fetching users
 */
interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  systemRole?: SystemRole;
  isActive?: boolean;
}

/**
 * Paginated users response
 */
interface PaginatedUsersResponse {
  data: User[];
  pagination: PaginationInfo;
}

/**
 * Update user params with ID
 */
interface UpdateUserParams extends UserUpdateInput {
  id: string;
}

/**
 * Update user role params
 */
interface UpdateUserRoleParams {
  id: string;
  systemRole: SystemRole;
}

/**
 * Church role assignment params
 */
interface ChurchRoleParams {
  userId: string;
  churchId: string;
  role: ChurchRole;
}

/**
 * Avatar upload params
 */
interface UploadAvatarParams {
  userId: string;
  image: string;
}

/**
 * Avatar response
 */
interface AvatarResponse {
  photoURL: string;
  user: User;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // CURRENT USER
    // ==========================================

    getMe: builder.query<User, void>({
      query: () => '/users/me',
      providesTags: ['User'],
      transformResponse: (response: { data: User }) => response.data,
    }),

    updateMe: builder.mutation<User, UserUpdateInput>({
      query: (data) => ({
        url: '/users/me',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
      transformResponse: (response: { data: User }) => response.data,
    }),

    // ==========================================
    // ADMIN: USER MANAGEMENT
    // ==========================================

    getUsers: builder.query<PaginatedUsersResponse, GetUsersParams>({
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
              ...result.data.map(({ id }) => ({ type: 'User' as TagType, id })),
              { type: 'User' as TagType, id: 'LIST' },
            ]
          : [{ type: 'User' as TagType, id: 'LIST' }],
      transformResponse: (response: { data: User[]; pagination: PaginationInfo }) => ({
        data: response.data,
        pagination: response.pagination,
      }),
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User' as TagType, id }],
      transformResponse: (response: { data: User }) => response.data,
    }),

    updateUser: builder.mutation<User, UpdateUserParams>({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User' as TagType, id },
        { type: 'User' as TagType, id: 'LIST' },
      ],
      transformResponse: (response: { data: User }) => response.data,
    }),

    updateUserRole: builder.mutation<User, UpdateUserRoleParams>({
      query: ({ id, systemRole }) => ({
        url: `/users/${id}/role`,
        method: 'PUT',
        body: { systemRole },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User' as TagType, id },
        { type: 'User' as TagType, id: 'LIST' },
      ],
      transformResponse: (response: { data: User }) => response.data,
    }),

    syncUser: builder.mutation<User, void>({
      query: () => ({
        url: '/users/sync',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
      transformResponse: (response: { data: User }) => response.data,
    }),

    deactivateUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}/deactivate`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'User' as TagType, id },
        { type: 'User' as TagType, id: 'LIST' },
      ],
    }),

    reactivateUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}/reactivate`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'User' as TagType, id },
        { type: 'User' as TagType, id: 'LIST' },
      ],
    }),

    // ==========================================
    // CHURCH ROLES
    // ==========================================

    assignChurchRole: builder.mutation<User, ChurchRoleParams>({
      query: ({ userId, churchId, role }) => ({
        url: `/users/${userId}/church-roles`,
        method: 'POST',
        body: { churchId, role },
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'User' as TagType, id: userId },
        { type: 'User' as TagType, id: 'LIST' },
        { type: 'Membership' as TagType, id: 'LIST' },
      ],
      transformResponse: (response: { data: User }) => response.data,
    }),

    updateChurchRole: builder.mutation<User, ChurchRoleParams>({
      query: ({ userId, churchId, role }) => ({
        url: `/users/${userId}/church-roles/${churchId}`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'User' as TagType, id: userId },
        { type: 'User' as TagType, id: 'LIST' },
        { type: 'Membership' as TagType, id: 'LIST' },
      ],
      transformResponse: (response: { data: User }) => response.data,
    }),

    removeChurchRole: builder.mutation<void, { userId: string; churchId: string }>({
      query: ({ userId, churchId }) => ({
        url: `/users/${userId}/church-roles/${churchId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'User' as TagType, id: userId },
        { type: 'User' as TagType, id: 'LIST' },
        { type: 'Membership' as TagType, id: 'LIST' },
      ],
    }),

    // ==========================================
    // PROFILE PICTURE
    // ==========================================

    uploadAvatar: builder.mutation<AvatarResponse, UploadAvatarParams>({
      query: ({ userId, image }) => ({
        url: `/users/${userId}/avatar`,
        method: 'POST',
        body: { image },
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'User' as TagType, id: userId },
        'User',
      ],
      transformResponse: (response: { data: AvatarResponse }) => response.data,
    }),

    removeAvatar: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/users/${userId}/avatar`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'User' as TagType, id: userId },
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
