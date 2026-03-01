/**
 * Role Service
 *
 * This service handles role-related operations:
 * - CRUD operations for roles
 * - Role assignment to users
 * - Permission calculation for roles
 */

import { db, serverTimestamp } from '../config/firebase';
import * as permissionService from './permission.service';

const COLLECTION = 'roles';

/**
 * Role document structure
 */
export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  scope: 'system' | 'church';
  churchId?: string;
  permissions: string[];
  isDefault: boolean;
  isEditable: boolean;
  color?: string;
  icon?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdBy: string;
}

/**
 * Input for creating a role
 */
export interface CreateRoleInput {
  name: string;
  description?: string;
  scope: 'system' | 'church';
  churchId?: string;
  permissions: string[];
  color?: string;
  icon?: string;
  createdBy: string;
}

/**
 * Input for updating a role
 */
export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissions?: string[];
  color?: string;
  icon?: string;
}

/**
 * Filters for listing roles
 */
export interface RoleFilters {
  scope?: 'system' | 'church';
  churchId?: string;
}

/**
 * Generate a slug from a name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Get all roles with optional filtering
 */
export async function getRoles(filters?: RoleFilters): Promise<Role[]> {
  let query: FirebaseFirestore.Query = db.collection(COLLECTION);

  if (filters?.scope) {
    query = query.where('scope', '==', filters.scope);
  }

  if (filters?.churchId) {
    query = query.where('churchId', '==', filters.churchId);
  }

  const snapshot = await query.orderBy('name').get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Role[];
}

/**
 * Get role by ID
 */
export async function getRoleById(roleId: string): Promise<Role | null> {
  const doc = await db.collection(COLLECTION).doc(roleId).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  } as Role;
}

/**
 * Get role by slug and scope
 */
export async function getRoleBySlug(
  slug: string,
  scope: 'system' | 'church',
  churchId?: string
): Promise<Role | null> {
  let query = db
    .collection(COLLECTION)
    .where('slug', '==', slug)
    .where('scope', '==', scope);

  if (churchId) {
    query = query.where('churchId', '==', churchId);
  }

  const snapshot = await query.limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Role;
}

/**
 * Create a new role
 */
export async function createRole(input: CreateRoleInput): Promise<Role> {
  const slug = generateSlug(input.name);

  // Check for duplicate slug in same scope
  const existing = await getRoleBySlug(slug, input.scope, input.churchId);
  if (existing) {
    throw new Error('A role with this name already exists');
  }

  // Validate permissions
  const validation = await permissionService.validatePermissionIds(input.permissions);
  if (!validation.valid) {
    throw new Error(`Invalid permission IDs: ${validation.invalidIds.join(', ')}`);
  }

  // Validate church ID for church-scoped roles
  if (input.scope === 'church' && !input.churchId) {
    throw new Error('Church ID is required for church-scoped roles');
  }

  const roleData = {
    name: input.name,
    slug,
    description: input.description || '',
    scope: input.scope,
    ...(input.churchId && { churchId: input.churchId }),
    permissions: input.permissions,
    isDefault: false,
    isEditable: true,
    color: input.color || '#1976d2',
    icon: input.icon || 'person',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: input.createdBy,
  };

  const docRef = await db.collection(COLLECTION).add(roleData);
  const newDoc = await docRef.get();

  return {
    id: docRef.id,
    ...newDoc.data(),
  } as Role;
}

/**
 * Update an existing role
 */
export async function updateRole(roleId: string, input: UpdateRoleInput): Promise<Role> {
  const roleRef = db.collection(COLLECTION).doc(roleId);
  const roleDoc = await roleRef.get();

  if (!roleDoc.exists) {
    throw new Error('Role not found');
  }

  const role = roleDoc.data() as Role;

  // Check if role is editable
  if (!role.isEditable) {
    throw new Error('This role cannot be modified');
  }

  // Validate permissions if being updated
  if (input.permissions) {
    const validation = await permissionService.validatePermissionIds(input.permissions);
    if (!validation.valid) {
      throw new Error(`Invalid permission IDs: ${validation.invalidIds.join(', ')}`);
    }
  }

  // Build update object
  const updateData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (input.name !== undefined) {
    updateData.name = input.name;
    updateData.slug = generateSlug(input.name);
  }
  if (input.description !== undefined) updateData.description = input.description;
  if (input.permissions !== undefined) updateData.permissions = input.permissions;
  if (input.color !== undefined) updateData.color = input.color;
  if (input.icon !== undefined) updateData.icon = input.icon;

  await roleRef.update(updateData);

  const updatedDoc = await roleRef.get();
  return {
    id: roleId,
    ...updatedDoc.data(),
  } as Role;
}

/**
 * Delete a role
 */
export async function deleteRole(roleId: string): Promise<void> {
  const roleRef = db.collection(COLLECTION).doc(roleId);
  const roleDoc = await roleRef.get();

  if (!roleDoc.exists) {
    throw new Error('Role not found');
  }

  const role = roleDoc.data() as Role;

  // Check if role can be deleted
  if (!role.isEditable) {
    throw new Error('This role cannot be deleted');
  }

  if (role.isDefault) {
    throw new Error('Default roles cannot be deleted');
  }

  // Check if role is in use
  const usersWithSystemRole = await db
    .collection('users')
    .where('systemRoleId', '==', roleId)
    .limit(1)
    .get();

  if (!usersWithSystemRole.empty) {
    throw new Error('Cannot delete role that is assigned to users');
  }

  // For church roles, check churchMemberships array
  // This is a simplified check - in production you might need a more thorough approach
  const usersWithChurchRole = await db
    .collection('users')
    .where('churchMemberships', 'array-contains', { roleId: roleId })
    .limit(1)
    .get();

  if (!usersWithChurchRole.empty) {
    throw new Error('Cannot delete role that is assigned to users');
  }

  await roleRef.delete();
}

/**
 * Duplicate an existing role
 */
export async function duplicateRole(
  roleId: string,
  newName: string,
  createdBy: string,
  targetChurchId?: string
): Promise<Role> {
  const originalRole = await getRoleById(roleId);

  if (!originalRole) {
    throw new Error('Role not found');
  }

  return createRole({
    name: newName,
    description: `Copy of ${originalRole.name}`,
    scope: targetChurchId ? 'church' : originalRole.scope,
    churchId: targetChurchId || originalRole.churchId,
    permissions: originalRole.permissions,
    color: originalRole.color,
    icon: originalRole.icon,
    createdBy,
  });
}

/**
 * Get permissions for a role
 */
export async function getRolePermissions(roleId: string): Promise<string[]> {
  const role = await getRoleById(roleId);

  if (!role) {
    return [];
  }

  return role.permissions;
}

/**
 * Get default system roles
 */
export async function getDefaultSystemRoles(): Promise<Role[]> {
  const snapshot = await db
    .collection(COLLECTION)
    .where('scope', '==', 'system')
    .where('isDefault', '==', true)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Role[];
}

/**
 * Get default church roles
 */
export async function getDefaultChurchRoles(): Promise<Role[]> {
  const snapshot = await db
    .collection(COLLECTION)
    .where('scope', '==', 'church')
    .where('isDefault', '==', true)
    .orderBy('name')
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Role[];
}
