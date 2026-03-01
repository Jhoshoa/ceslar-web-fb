/**
 * Roles API - RTK Query Endpoints
 *
 * Manages role CRUD operations.
 * - System roles: require system_admin
 * - Church roles: require church admin for the specific church
 */

import { baseApi, TagType } from './baseApi';
import type {
  Role,
  RoleCreateInput,
  RoleUpdateInput,
  RoleDuplicateInput,
  RoleQueryFilters,
  DefaultRolesResponse,
} from '@ceslar/shared-types';

/**
 * Update role params (with ID)
 */
interface UpdateRoleParams extends RoleUpdateInput {
  id: string;
}

/**
 * Duplicate role params (with ID)
 */
interface DuplicateRoleParams extends RoleDuplicateInput {
  id: string;
}

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // ROLE QUERIES
    // ==========================================

    /**
     * Get all roles with optional filtering
     */
    getRoles: builder.query<Role[], RoleQueryFilters | void>({
      query: (params) => ({
        url: '/roles',
        params: params
          ? {
              scope: params.scope,
              churchId: params.churchId,
            }
          : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Role' as TagType, id })),
              { type: 'Role' as TagType, id: 'LIST' },
            ]
          : [{ type: 'Role' as TagType, id: 'LIST' }],
      transformResponse: (response: { data: Role[] }) => response.data,
    }),

    /**
     * Get default roles (system and church)
     */
    getDefaultRoles: builder.query<DefaultRolesResponse, void>({
      query: () => '/roles/defaults',
      providesTags: [{ type: 'Role' as TagType, id: 'DEFAULTS' }],
      transformResponse: (response: { data: DefaultRolesResponse }) => response.data,
    }),

    /**
     * Get a single role by ID
     */
    getRoleById: builder.query<Role, string>({
      query: (id) => `/roles/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Role' as TagType, id }],
      transformResponse: (response: { data: Role }) => response.data,
    }),

    // ==========================================
    // ROLE MUTATIONS
    // ==========================================

    /**
     * Create a new role
     */
    createRole: builder.mutation<Role, RoleCreateInput>({
      query: (data) => ({
        url: '/roles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Role' as TagType, id: 'LIST' }],
      transformResponse: (response: { data: Role }) => response.data,
    }),

    /**
     * Update an existing role
     */
    updateRole: builder.mutation<Role, UpdateRoleParams>({
      query: ({ id, ...data }) => ({
        url: `/roles/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Role' as TagType, id },
        { type: 'Role' as TagType, id: 'LIST' },
      ],
      transformResponse: (response: { data: Role }) => response.data,
    }),

    /**
     * Delete a role
     */
    deleteRole: builder.mutation<void, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Role' as TagType, id },
        { type: 'Role' as TagType, id: 'LIST' },
      ],
    }),

    /**
     * Duplicate a role
     */
    duplicateRole: builder.mutation<Role, DuplicateRoleParams>({
      query: ({ id, ...data }) => ({
        url: `/roles/${id}/duplicate`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Role' as TagType, id: 'LIST' }],
      transformResponse: (response: { data: Role }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  // Queries
  useGetRolesQuery,
  useGetDefaultRolesQuery,
  useGetRoleByIdQuery,
  // Mutations
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useDuplicateRoleMutation,
} = rolesApi;
