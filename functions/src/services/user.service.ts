/**
 * User Service
 *
 * Business logic for user management.
 */

import { db, auth, serverTimestamp } from '../config/firebase';
import { getPaginatedResults, PaginatedResults } from '../utils/pagination.utils';
import { setUserRole, setChurchRole, removeChurchRole as removeChurchRoleClaim } from './auth.service';
import {
  User,
  UserData,
  UserUpdateInput,
  UserQueryFilters,
  SystemRole,
  ChurchRole,
  UserChurchMembership,
  RegistrationAnswer,
} from '@ceslar/shared-types';

const COLLECTION = 'users';

/**
 * Auth user data from Firebase
 */
interface AuthUserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const doc = await db.collection(COLLECTION).doc(userId).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...(doc.data() as UserData),
    createdAt: doc.data()?.createdAt,
    updatedAt: doc.data()?.updatedAt,
  };
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
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
    ...(doc.data() as UserData),
    createdAt: doc.data()?.createdAt,
    updatedAt: doc.data()?.updatedAt,
  };
}

/**
 * Get users with pagination and filters
 */
export async function getUsers(
  options: UserQueryFilters = {}
): Promise<PaginatedResults<User>> {
  const {
    page = 1,
    limit = 10,
    search,
    systemRole,
    churchId,
    isActive,
  } = options;

  const filters: Record<string, unknown> = {};

  if (systemRole) {
    filters.systemRole = systemRole;
  }

  if (typeof isActive === 'boolean') {
    filters.isActive = isActive;
  }

  const result = await getPaginatedResults(
    db.collection(COLLECTION) as FirebaseFirestore.CollectionReference<UserData>,
    {
      filters,
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      page,
      limit,
    }
  );

  let data = result.data as User[];

  // If search is provided, filter in memory (for small datasets)
  if (search) {
    const searchLower = search.toLowerCase();
    data = data.filter(
      (user) =>
        user.email?.toLowerCase().includes(searchLower) ||
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower)
    );
  }

  // If churchId filter, filter by membership
  if (churchId) {
    data = data.filter((user) =>
      user.churchMemberships?.some((m) => m.churchId === churchId)
    );
  }

  return { data, pagination: result.pagination };
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  data: Partial<UserUpdateInput>
): Promise<User | null> {
  const userRef = db.collection(COLLECTION).doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error('User not found');
  }

  // Filter allowed fields
  const allowedFields: (keyof UserUpdateInput)[] = [
    'displayName',
    'firstName',
    'lastName',
    'photoURL',
    'phoneNumber',
    'preferences',
  ];

  const updateData: Record<string, unknown> = {};
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  updateData.updatedAt = serverTimestamp();

  await userRef.update(updateData);

  // Update Firebase Auth profile if displayName or photoURL changed
  if (data.displayName || data.photoURL) {
    const authUpdate: { displayName?: string; photoURL?: string } = {};
    if (data.displayName) authUpdate.displayName = data.displayName;
    if (data.photoURL) authUpdate.photoURL = data.photoURL;

    await auth.updateUser(userId, authUpdate);
  }

  return getUserById(userId);
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  userId: string,
  systemRole: SystemRole
): Promise<User | null> {
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
  await setUserRole(userId, systemRole);

  return getUserById(userId);
}

/**
 * Sync user from Firebase Auth
 * Called after login to ensure Firestore is up to date
 */
export async function syncUser(authUser: AuthUserData): Promise<User | null> {
  const { uid, email, displayName, photoURL } = authUser;
  const userRef = db.collection(COLLECTION).doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    // User doesn't exist in Firestore, create them
    const userData = {
      email: email || '',
      displayName: displayName || '',
      firstName: '',
      lastName: '',
      photoURL: photoURL || null,
      phoneNumber: null,
      systemRole: 'user' as const,
      churchMemberships: [],
      registrationAnswers: [],
      preferences: {
        language: 'es' as const,
        notifications: {
          email: true,
          push: false,
          sms: false,
        },
        display: {
          theme: 'light' as const,
          compactMode: false,
        },
      },
      isActive: true,
      emailVerified: false,
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
 */
export async function saveRegistrationAnswers(
  userId: string,
  answers: RegistrationAnswer[]
): Promise<User | null> {
  const userRef = db.collection(COLLECTION).doc(userId);

  await userRef.update({
    registrationAnswers: answers,
    updatedAt: serverTimestamp(),
  });

  return getUserById(userId);
}

/**
 * Deactivate user
 */
export async function deactivateUser(userId: string): Promise<void> {
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
 */
export async function reactivateUser(userId: string): Promise<void> {
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
 */
export async function assignChurchRole(
  userId: string,
  churchId: string,
  role: ChurchRole
): Promise<User | null> {
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

  const userData = doc.data() as UserData;
  const churchMemberships: UserChurchMembership[] = userData.churchMemberships || [];

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
    const churchData = churchDoc.data();
    churchMemberships.push({
      churchId,
      churchName: churchData?.name || '',
      role,
      status: 'approved',
      joinedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  await userRef.update({
    churchMemberships,
    updatedAt: serverTimestamp(),
  });

  // Update custom claims
  await setChurchRole(userId, churchId, role);

  return getUserById(userId);
}

/**
 * Remove a church role from a user
 */
export async function removeChurchRole(
  userId: string,
  churchId: string
): Promise<void> {
  const userRef = db.collection(COLLECTION).doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error('User not found');
  }

  const userData = doc.data() as UserData;
  const churchMemberships = (userData.churchMemberships || []).filter(
    (m) => m.churchId !== churchId
  );

  await userRef.update({
    churchMemberships,
    updatedAt: serverTimestamp(),
  });

  // Remove from custom claims
  await removeChurchRoleClaim(userId, churchId);
}
