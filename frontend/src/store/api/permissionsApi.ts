/**
 * Permissions API - RTK Query Endpoints
 *
 * Manages permission retrieval (read-only).
 * All endpoints require system_admin role.
 */

import { baseApi, TagType } from './baseApi';
import type {
  PermissionEntity,
  PermissionsByCategory,
  PermissionScope,
} from '@ceslar/shared-types';

/**
 * Query parameters for fetching permissions
 */
interface GetPermissionsParams {
  scope?: PermissionScope;
}

export const permissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // PERMISSIONS
    // ==========================================

    /**
     * Get all permissions with optional scope filter
     */
    getPermissions: builder.query<PermissionEntity[], GetPermissionsParams | void>({
      query: (params) => ({
        url: '/permissions',
        params: params ? { scope: params.scope } : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Permission' as TagType, id })),
              { type: 'Permission' as TagType, id: 'LIST' },
            ]
          : [{ type: 'Permission' as TagType, id: 'LIST' }],
      transformResponse: (response: { data: PermissionEntity[] }) => response.data,
    }),

    /**
     * Get permissions grouped by category
     */
    getPermissionsByCategory: builder.query<PermissionsByCategory, void>({
      query: () => '/permissions/categories',
      providesTags: [{ type: 'Permission' as TagType, id: 'CATEGORIES' }],
      transformResponse: (response: { data: PermissionsByCategory }) => response.data,
    }),

    /**
     * Get a single permission by ID
     */
    getPermissionById: builder.query<PermissionEntity, string>({
      query: (id) => `/permissions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Permission' as TagType, id }],
      transformResponse: (response: { data: PermissionEntity }) => response.data,
    }),

    /**
     * Get permissions for a specific resource
     */
    getPermissionsByResource: builder.query<PermissionEntity[], string>({
      query: (resource) => `/permissions/resource/${resource}`,
      providesTags: (_result, _error, resource) => [
        { type: 'Permission' as TagType, id: `resource:${resource}` },
      ],
      transformResponse: (response: { data: PermissionEntity[] }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPermissionsQuery,
  useGetPermissionsByCategoryQuery,
  useGetPermissionByIdQuery,
  useGetPermissionsByResourceQuery,
} = permissionsApi;
