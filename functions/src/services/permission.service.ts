/**
 * Permission Service
 *
 * This service handles permission-related operations:
 * - Listing all available permissions
 * - Getting permissions by category
 * - Validating permission IDs
 */

import { db } from '../config/firebase';

const COLLECTION = 'permissions';

/**
 * Permission document structure
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  category: string;
  scope: 'system' | 'church' | 'both';
  dependencies?: string[];
  isActive: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}

/**
 * Get all active permissions
 */
export async function getAllPermissions(): Promise<Permission[]> {
  const snapshot = await db
    .collection(COLLECTION)
    .where('isActive', '==', true)
    .orderBy('category')
    .orderBy('name')
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Permission[];
}

/**
 * Get permissions grouped by category
 */
export async function getPermissionsByCategory(): Promise<Record<string, Permission[]>> {
  const permissions = await getAllPermissions();

  const categories: Record<string, Permission[]> = {};

  for (const permission of permissions) {
    if (!categories[permission.category]) {
      categories[permission.category] = [];
    }
    categories[permission.category].push(permission);
  }

  return categories;
}

/**
 * Get permission by ID
 */
export async function getPermissionById(permissionId: string): Promise<Permission | null> {
  const doc = await db.collection(COLLECTION).doc(permissionId).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  } as Permission;
}

/**
 * Validate that all permission IDs exist and are active
 */
export async function validatePermissionIds(permissionIds: string[]): Promise<{
  valid: boolean;
  invalidIds: string[];
}> {
  const invalidIds: string[] = [];

  // Check for wildcard permission
  if (permissionIds.includes('*')) {
    return { valid: true, invalidIds: [] };
  }

  // Validate each permission ID
  for (const id of permissionIds) {
    const permission = await getPermissionById(id);
    if (!permission || !permission.isActive) {
      invalidIds.push(id);
    }
  }

  return {
    valid: invalidIds.length === 0,
    invalidIds,
  };
}

/**
 * Get permissions by scope
 */
export async function getPermissionsByScope(
  scope: 'system' | 'church' | 'both'
): Promise<Permission[]> {
  const permissions = await getAllPermissions();

  if (scope === 'both') {
    return permissions;
  }

  return permissions.filter(
    (p) => p.scope === scope || p.scope === 'both'
  );
}

/**
 * Get permission IDs for a given resource
 */
export async function getPermissionsByResource(resource: string): Promise<Permission[]> {
  const snapshot = await db
    .collection(COLLECTION)
    .where('resource', '==', resource)
    .where('isActive', '==', true)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Permission[];
}
