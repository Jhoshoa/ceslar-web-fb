/**
 * Role & Permission Types
 *
 * Types for the customizable roles and permissions system.
 */

import { WithTimestamps } from './common.types';

// ============================================
// PERMISSION ENTITY
// ============================================

/**
 * Permission scope - where the permission applies
 */
export type PermissionScope = 'system' | 'church' | 'both';

/**
 * Permission entity data (stored in Firestore)
 */
export interface PermissionData {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  scope: PermissionScope;
  category: string;
  isActive: boolean;
}

/**
 * Full Permission entity (with timestamps)
 */
export interface PermissionEntity extends PermissionData, WithTimestamps {}

/**
 * Permissions grouped by category
 */
export type PermissionsByCategory = Record<string, PermissionEntity[]>;

// ============================================
// ROLE ENTITY
// ============================================

/**
 * Role scope - system-wide or church-specific
 */
export type RoleScope = 'system' | 'church';

/**
 * Role entity data (stored in Firestore)
 */
export interface RoleData {
  name: string;
  description?: string;
  scope: RoleScope;
  churchId?: string;
  permissions: string[];
  color?: string;
  icon?: string;
  isDefault: boolean;
  isActive: boolean;
  createdBy?: string;
}

/**
 * Full Role entity (with ID and timestamps)
 */
export interface Role extends RoleData, WithTimestamps {
  id: string;
}

/**
 * Role with populated permissions
 */
export interface RoleWithPermissions extends Omit<Role, 'permissions'> {
  permissions: PermissionEntity[];
}

// ============================================
// ROLE CRUD INPUTS
// ============================================

/**
 * Create role input
 */
export interface RoleCreateInput {
  name: string;
  description?: string;
  scope: RoleScope;
  churchId?: string;
  permissions: string[];
  color?: string;
  icon?: string;
}

/**
 * Update role input
 */
export interface RoleUpdateInput {
  name?: string;
  description?: string;
  permissions?: string[];
  color?: string;
  icon?: string;
}

/**
 * Duplicate role input
 */
export interface RoleDuplicateInput {
  newName: string;
  churchId?: string;
}

// ============================================
// QUERY FILTERS
// ============================================

/**
 * Role query filters
 */
export interface RoleQueryFilters {
  scope?: RoleScope;
  churchId?: string;
}

/**
 * Permission query filters
 */
export interface PermissionQueryFilters {
  scope?: PermissionScope;
  resource?: string;
  category?: string;
}

// ============================================
// DEFAULT ROLES RESPONSE
// ============================================

/**
 * Default roles response
 */
export interface DefaultRolesResponse {
  system: Role[];
  church: Role[];
}
