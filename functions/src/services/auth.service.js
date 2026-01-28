/**
 * Auth Service
 *
 * This service handles authentication-related operations:
 * - Managing custom claims (system roles, church roles, permissions)
 * - Refreshing user tokens
 * - Getting user authentication state
 */

const { db, auth, serverTimestamp } = require('../config/firebase');

/**
 * System roles with their base permissions
 */
const SYSTEM_ROLE_PERMISSIONS = {
  system_admin: ['read:all', 'write:all', 'delete:all', 'admin:all'],
  user: ['read:public'],
};

/**
 * Church roles with their base permissions
 */
const CHURCH_ROLE_PERMISSIONS = {
  admin: ['read:church', 'write:church', 'delete:church', 'admin:church'],
  pastor: ['read:church', 'write:church', 'delete:church', 'admin:church'],
  leader: ['read:church', 'write:church'],
  staff: ['read:church', 'write:church'],
  member: ['read:church'],
  visitor: ['read:public'],
};

/**
 * Set system role for a user
 *
 * @param {string} userId - The user's Firebase UID
 * @param {string} systemRole - The system role to assign ('system_admin' or 'user')
 * @returns {Promise<Object>} Result with success status
 */
async function setUserRole(userId, systemRole) {
  if (!['system_admin', 'user'].includes(systemRole)) {
    throw new Error(`Invalid system role: ${systemRole}`);
  }

  // Get current claims
  const user = await auth.getUser(userId);
  const currentClaims = user.customClaims || {};

  // Update claims with new system role
  const newClaims = {
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
 *
 * @param {string} userId - The user's Firebase UID
 * @param {string} churchId - The church ID
 * @param {string} role - The church role to assign
 * @returns {Promise<Object>} Result with success status
 */
async function setChurchRole(userId, churchId, role) {
  const validRoles = ['admin', 'pastor', 'leader', 'staff', 'member', 'visitor'];
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid church role: ${role}`);
  }

  // Get current claims
  const user = await auth.getUser(userId);
  const currentClaims = user.customClaims || {};
  const churchRoles = currentClaims.churchRoles || {};

  // Update church roles
  const newChurchRoles = {
    ...churchRoles,
    [churchId]: role,
  };

  // Update claims
  const newClaims = {
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
 *
 * @param {string} userId - The user's Firebase UID
 * @param {string} churchId - The church ID to remove
 * @returns {Promise<Object>} Result with success status
 */
async function removeChurchRole(userId, churchId) {
  // Get current claims
  const user = await auth.getUser(userId);
  const currentClaims = user.customClaims || {};
  const churchRoles = { ...(currentClaims.churchRoles || {}) };

  // Remove church role
  delete churchRoles[churchId];

  // Update claims
  const newClaims = {
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
 *
 * @param {string} userId - The user's Firebase UID
 * @returns {Promise<Object>} The user's custom claims
 */
async function getUserClaims(userId) {
  const user = await auth.getUser(userId);
  return user.customClaims || {
    systemRole: 'user',
    churchRoles: {},
    permissions: ['read:public'],
  };
}

/**
 * Force refresh user's custom claims
 * This will trigger the client to refresh their token
 *
 * @param {string} userId - The user's Firebase UID
 * @returns {Promise<Object>} The updated claims
 */
async function refreshUserClaims(userId) {
  const user = await auth.getUser(userId);
  const currentClaims = user.customClaims || {};

  // Recalculate permissions
  const newClaims = {
    ...currentClaims,
    permissions: calculatePermissions(
      currentClaims.systemRole || 'user',
      currentClaims.churchRoles || {},
    ),
    refreshedAt: new Date().toISOString(),
  };

  await auth.setCustomUserClaims(userId, newClaims);

  return newClaims;
}

/**
 * Calculate combined permissions from system role and church roles
 *
 * @param {string} systemRole - The user's system role
 * @param {Object} churchRoles - Map of churchId -> role
 * @returns {string[]} Array of permission strings
 */
function calculatePermissions(systemRole, churchRoles) {
  const permissions = new Set();

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
 *
 * @param {Object} claims - The user's custom claims
 * @param {string} permission - The permission to check
 * @returns {boolean} Whether the user has the permission
 */
function hasPermission(claims, permission) {
  const permissions = claims.permissions || [];
  return permissions.includes(permission) || permissions.includes('admin:all');
}

/**
 * Check if user is system admin
 *
 * @param {Object} claims - The user's custom claims
 * @returns {boolean} Whether the user is a system admin
 */
function isSystemAdmin(claims) {
  return claims.systemRole === 'system_admin';
}

/**
 * Check if user is admin for a specific church
 *
 * @param {Object} claims - The user's custom claims
 * @param {string} churchId - The church ID
 * @returns {boolean} Whether the user is a church admin
 */
function isChurchAdmin(claims, churchId) {
  if (isSystemAdmin(claims)) return true;
  const role = claims.churchRoles?.[churchId];
  return role === 'admin' || role === 'pastor';
}

/**
 * Check if user has a specific church role
 *
 * @param {Object} claims - The user's custom claims
 * @param {string} churchId - The church ID
 * @param {string[]} roles - Array of acceptable roles
 * @returns {boolean} Whether the user has one of the roles
 */
function hasChurchRole(claims, churchId, roles) {
  if (isSystemAdmin(claims)) return true;
  const userRole = claims.churchRoles?.[churchId];
  return roles.includes(userRole);
}

module.exports = {
  setUserRole,
  setChurchRole,
  removeChurchRole,
  getUserClaims,
  refreshUserClaims,
  calculatePermissions,
  hasPermission,
  isSystemAdmin,
  isChurchAdmin,
  hasChurchRole,
  SYSTEM_ROLE_PERMISSIONS,
  CHURCH_ROLE_PERMISSIONS,
};
