/**
 * Auth Service
 *
 * This service handles authentication-related operations:
 * - Managing custom claims (system roles, church roles, permissions)
 * - Refreshing user tokens
 * - Getting user authentication state
 */

import { db, auth, serverTimestamp } from '../config/firebase';
import {
  SystemRole,
  ChurchRole,
  Permission,
  UserClaims,
} from '@ceslar/shared-types';

/**
 * System roles with their base permissions
 */
export const SYSTEM_ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  system_admin: ['read:all', 'write:all', 'delete:all', 'admin:all'],
  user: ['read:public'],
};

/**
 * Church roles with their base permissions
 */
export const CHURCH_ROLE_PERMISSIONS: Record<ChurchRole, Permission[]> = {
  admin: ['read:church', 'write:church', 'delete:church', 'admin:church'],
  pastor: ['read:church', 'write:church', 'delete:church', 'admin:church'],
  leader: ['read:church', 'write:church'],
  staff: ['read:church', 'write:church'],
  member: ['read:church'],
  visitor: ['read:public'],
};

/**
 * Result from role operations
 */
interface RoleOperationResult {
  success: boolean;
  userId: string;
  systemRole?: SystemRole;
  churchId?: string;
  role?: ChurchRole;
}

/**
 * Set system role for a user
 */
export async function setUserRole(
  userId: string,
  systemRole: SystemRole
): Promise<RoleOperationResult> {
  const validRoles: SystemRole[] = ['system_admin', 'user'];
  if (!validRoles.includes(systemRole)) {
    throw new Error(`Invalid system role: ${systemRole}`);
  }

  // Get current claims
  const user = await auth.getUser(userId);
  const currentClaims = (user.customClaims || {}) as UserClaims;

  // Update claims with new system role
  const newClaims: UserClaims = {
    ...currentClaims,
    systemRole,
    permissions: calculatePermissions(systemRole, currentClaims.churchRoles || {}),
    updatedAt: new Date().toISOString(),
  };

  await auth.setCustomUserClaims(userId, newClaims);

  // Update Firestore document
  await db.collection('users').doc(userId).update({
    systemRole,
    updatedAt: serverTimestamp(),
  });

  return { success: true, userId, systemRole };
}

/**
 * Set church role for a user
 */
export async function setChurchRole(
  userId: string,
  churchId: string,
  role: ChurchRole
): Promise<RoleOperationResult> {
  const validRoles: ChurchRole[] = ['admin', 'pastor', 'leader', 'staff', 'member', 'visitor'];
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid church role: ${role}`);
  }

  // Get current claims
  const user = await auth.getUser(userId);
  const currentClaims = (user.customClaims || {}) as UserClaims;
  const churchRoles = currentClaims.churchRoles || {};

  // Update church roles
  const newChurchRoles: Record<string, ChurchRole> = {
    ...churchRoles,
    [churchId]: role,
  };

  // Update claims
  const newClaims: UserClaims = {
    ...currentClaims,
    churchRoles: newChurchRoles,
    permissions: calculatePermissions(currentClaims.systemRole || 'user', newChurchRoles),
    updatedAt: new Date().toISOString(),
  };

  await auth.setCustomUserClaims(userId, newClaims);

  return { success: true, userId, churchId, role };
}

/**
 * Remove church role for a user
 */
export async function removeChurchRole(
  userId: string,
  churchId: string
): Promise<{ success: boolean; userId: string; churchId: string }> {
  // Get current claims
  const user = await auth.getUser(userId);
  const currentClaims = (user.customClaims || {}) as UserClaims;
  const churchRoles: Record<string, ChurchRole> = { ...(currentClaims.churchRoles || {}) };

  // Remove church role
  delete churchRoles[churchId];

  // Update claims
  const newClaims: UserClaims = {
    ...currentClaims,
    churchRoles,
    permissions: calculatePermissions(currentClaims.systemRole || 'user', churchRoles),
    updatedAt: new Date().toISOString(),
  };

  await auth.setCustomUserClaims(userId, newClaims);

  return { success: true, userId, churchId };
}

/**
 * Get user's custom claims
 */
export async function getUserClaims(userId: string): Promise<UserClaims> {
  const user = await auth.getUser(userId);
  return (user.customClaims as UserClaims) || {
    systemRole: 'user',
    churchRoles: {},
    permissions: ['read:public'],
  };
}

/**
 * Force refresh user's custom claims
 * This will trigger the client to refresh their token
 */
export async function refreshUserClaims(userId: string): Promise<UserClaims> {
  const user = await auth.getUser(userId);
  const currentClaims = (user.customClaims || {}) as UserClaims;

  // Recalculate permissions
  const newClaims: UserClaims = {
    ...currentClaims,
    permissions: calculatePermissions(
      currentClaims.systemRole || 'user',
      currentClaims.churchRoles || {}
    ),
    refreshedAt: new Date().toISOString(),
  };

  await auth.setCustomUserClaims(userId, newClaims);

  return newClaims;
}

/**
 * Calculate combined permissions from system role and church roles
 */
export function calculatePermissions(
  systemRole: SystemRole,
  churchRoles: Record<string, ChurchRole>
): Permission[] {
  const permissions = new Set<Permission>();

  // Add system role permissions
  const systemPerms = SYSTEM_ROLE_PERMISSIONS[systemRole] || SYSTEM_ROLE_PERMISSIONS.user;
  systemPerms.forEach((p) => permissions.add(p));

  // Add church role permissions
  Object.values(churchRoles).forEach((role) => {
    const rolePerms = CHURCH_ROLE_PERMISSIONS[role] || [];
    rolePerms.forEach((p) => permissions.add(p));
  });

  return Array.from(permissions);
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(claims: UserClaims, permission: Permission): boolean {
  const permissions = claims.permissions || [];
  return permissions.includes(permission) || permissions.includes('admin:all');
}

/**
 * Check if user is system admin
 */
export function isSystemAdmin(claims: UserClaims): boolean {
  return claims.systemRole === 'system_admin';
}

/**
 * Check if user is admin for a specific church
 */
export function isChurchAdmin(claims: UserClaims, churchId: string): boolean {
  if (isSystemAdmin(claims)) return true;
  const role = claims.churchRoles?.[churchId];
  return role === 'admin' || role === 'pastor';
}

/**
 * Check if user has a specific church role
 */
export function hasChurchRole(
  claims: UserClaims,
  churchId: string,
  roles: ChurchRole[]
): boolean {
  if (isSystemAdmin(claims)) return true;
  const userRole = claims.churchRoles?.[churchId];
  return userRole !== undefined && roles.includes(userRole);
}
