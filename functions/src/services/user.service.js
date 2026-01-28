/**
 * User Service
 *
 * Business logic for user management.
 */

const { db, auth, serverTimestamp } = require('../config/firebase');
const { getPaginatedResults } = require('../utils/pagination.utils');

const COLLECTION = 'users';

/**
 * Get user by ID
 *
 * @param {string} userId - User ID (Firebase UID)
 * @returns {Promise<Object|null>} User data or null
 */
async function getUserById(userId) {
  const doc = await db.collection(COLLECTION).doc(userId).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  };
}

/**
 * Get user by email
 *
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User data or null
 */
async function getUserByEmail(email) {
  const snapshot = await db
    .collection(COLLECTION)
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  };
}

/**
 * Get users with pagination and filters
 *
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated users
 */
async function getUsers(options = {}) {
  const {
    page = 1,
    limit = 10,
    search,
    systemRole,
    churchId,
    isActive,
  } = options;

  const filters = {};

  if (systemRole) {
    filters.systemRole = systemRole;
  }

  if (typeof isActive === 'boolean') {
    filters.isActive = isActive;
  }

  // For church-specific users, we need to filter by churchMemberships
  // This is complex in Firestore, so we'll handle it differently
  const result = await getPaginatedResults(db.collection(COLLECTION), {
    filters,
    orderBy: [{ field: 'createdAt', direction: 'desc' }],
    page,
    limit,
  });

  // If search is provided, filter in memory (for small datasets)
  // For larger datasets, consider using a search service like Algolia
  if (search) {
    const searchLower = search.toLowerCase();
    result.data = result.data.filter(
      (user) =>
        user.email?.toLowerCase().includes(searchLower) ||
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower),
    );
  }

  // If churchId filter, filter by membership
  if (churchId) {
    result.data = result.data.filter((user) =>
      user.churchMemberships?.some((m) => m.churchId === churchId),
    );
  }

  return result;
}

/**
 * Update user profile
 *
 * @param {string} userId - User ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated user
 */
async function updateUser(userId, data) {
  const userRef = db.collection(COLLECTION).doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error('User not found');
  }

  // Filter allowed fields
  const allowedFields = [
    'displayName',
    'firstName',
    'lastName',
    'photoURL',
    'phoneNumber',
    'preferences',
  ];

  const updateData = {};
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  updateData.updatedAt = serverTimestamp();

  await userRef.update(updateData);

  // Update Firebase Auth profile if displayName or photoURL changed
  if (data.displayName || data.photoURL) {
    const authUpdate = {};
    if (data.displayName) authUpdate.displayName = data.displayName;
    if (data.photoURL) authUpdate.photoURL = data.photoURL;

    await auth.updateUser(userId, authUpdate);
  }

  return getUserById(userId);
}

/**
 * Update user role (admin only)
 *
 * @param {string} userId - User ID
 * @param {string} systemRole - New system role
 * @returns {Promise<Object>} Updated user
 */
async function updateUserRole(userId, systemRole) {
  const userRef = db.collection(COLLECTION).doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error('User not found');
  }

  // Update Firestore
  await userRef.update({
    systemRole,
    updatedAt: serverTimestamp(),
  });

  // Update custom claims
  const { setUserRole } = require('./auth.service');
  await setUserRole(userId, systemRole);

  return getUserById(userId);
}

/**
 * Sync user from Firebase Auth
 * Called after login to ensure Firestore is up to date
 *
 * @param {Object} authUser - Firebase Auth user data
 * @returns {Promise<Object>} Synced user
 */
async function syncUser(authUser) {
  const { uid, email, displayName, photoURL } = authUser;
  const userRef = db.collection(COLLECTION).doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    // User doesn't exist in Firestore, create them
    // This shouldn't normally happen since auth trigger creates the doc
    const userData = {
      email,
      displayName: displayName || '',
      firstName: '',
      lastName: '',
      photoURL: photoURL || null,
      systemRole: 'user',
      churchMemberships: [],
      registrationAnswers: [],
      preferences: {
        language: 'es',
        emailNotifications: true,
        smsNotifications: false,
        newsletter: true,
      },
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    await userRef.set(userData);
  } else {
    // Update last login
    await userRef.update({
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return getUserById(uid);
}

/**
 * Save registration answers
 *
 * @param {string} userId - User ID
 * @param {Array} answers - Registration answers
 * @returns {Promise<Object>} Updated user
 */
async function saveRegistrationAnswers(userId, answers) {
  const userRef = db.collection(COLLECTION).doc(userId);

  await userRef.update({
    registrationAnswers: answers,
    updatedAt: serverTimestamp(),
  });

  return getUserById(userId);
}

/**
 * Deactivate user
 *
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function deactivateUser(userId) {
  const userRef = db.collection(COLLECTION).doc(userId);

  await userRef.update({
    isActive: false,
    updatedAt: serverTimestamp(),
  });

  // Disable in Firebase Auth
  await auth.updateUser(userId, { disabled: true });
}

/**
 * Reactivate user
 *
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function reactivateUser(userId) {
  const userRef = db.collection(COLLECTION).doc(userId);

  await userRef.update({
    isActive: true,
    updatedAt: serverTimestamp(),
  });

  // Enable in Firebase Auth
  await auth.updateUser(userId, { disabled: false });
}

/**
 * Assign a church role to a user
 *
 * @param {string} userId - User ID
 * @param {string} churchId - Church ID
 * @param {string} role - Church role
 * @returns {Promise<Object>} Updated user
 */
async function assignChurchRole(userId, churchId, role) {
  const userRef = db.collection(COLLECTION).doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error('User not found');
  }

  // Verify church exists
  const churchDoc = await db.collection('churches').doc(churchId).get();
  if (!churchDoc.exists) {
    throw new Error('Church not found');
  }

  const userData = doc.data();
  const churchMemberships = userData.churchMemberships || [];

  // Check if user already has a membership for this church
  const existingIndex = churchMemberships.findIndex((m) => m.churchId === churchId);

  if (existingIndex >= 0) {
    // Update existing membership
    churchMemberships[existingIndex] = {
      ...churchMemberships[existingIndex],
      role,
      updatedAt: new Date().toISOString(),
    };
  } else {
    // Add new membership
    churchMemberships.push({
      churchId,
      churchName: churchDoc.data().name,
      role,
      joinedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  await userRef.update({
    churchMemberships,
    updatedAt: serverTimestamp(),
  });

  // Update custom claims
  const { setChurchRole } = require('./auth.service');
  await setChurchRole(userId, churchId, role);

  return getUserById(userId);
}

/**
 * Remove a church role from a user
 *
 * @param {string} userId - User ID
 * @param {string} churchId - Church ID
 * @returns {Promise<void>}
 */
async function removeChurchRole(userId, churchId) {
  const userRef = db.collection(COLLECTION).doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error('User not found');
  }

  const userData = doc.data();
  const churchMemberships = (userData.churchMemberships || []).filter(
    (m) => m.churchId !== churchId,
  );

  await userRef.update({
    churchMemberships,
    updatedAt: serverTimestamp(),
  });

  // Remove from custom claims
  const { removeChurchRole: removeChurchRoleClaim } = require('./auth.service');
  await removeChurchRoleClaim(userId, churchId);
}

module.exports = {
  getUserById,
  getUserByEmail,
  getUsers,
  updateUser,
  updateUserRole,
  syncUser,
  saveRegistrationAnswers,
  deactivateUser,
  reactivateUser,
  assignChurchRole,
  removeChurchRole,
};
