/**
 * Users Seeder
 *
 * Seeds users in both Firebase Auth and Firestore.
 * Also adds users to church member subcollections.
 */

const { FieldValue } = require('firebase-admin/firestore');
const usersData = require('./data/users.json');

const COLLECTION = 'users';

/**
 * Seed users in Firebase Auth + Firestore + church memberships
 */
async function seedUsers(db, auth, options = {}) {
  const { force = false } = options;
  const collection = db.collection(COLLECTION);

  // Check if data already exists
  if (!force) {
    const snapshot = await collection.limit(1).get();
    if (!snapshot.empty) {
      console.log('(already exist, skipping)');
      return 0;
    }
  }

  let count = 0;

  for (const user of usersData) {
    try {
      // Create or get Firebase Auth user
      let authUser;
      try {
        authUser = await auth.getUserByEmail(user.email);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          authUser = await auth.createUser({
            email: user.email,
            password: user.password || 'Password123!',
            displayName: user.displayName,
            photoURL: user.photoURL || undefined,
            emailVerified: true,
          });
        } else {
          throw error;
        }
      }

      // Set custom claims
      await auth.setCustomUserClaims(authUser.uid, {
        systemRole: user.systemRole || 'user',
        churchRoles: user.churchRoles || {},
        permissions: user.permissions || ['read:public'],
      });

      // Create Firestore user document
      const userDoc = {
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        photoURL: user.photoURL || null,
        phoneNumber: user.phoneNumber || null,
        systemRole: user.systemRole || 'user',
        churchMemberships: user.churchMemberships || [],
        registrationAnswers: [],
        preferences: user.preferences || {
          language: 'es',
          theme: 'light',
          emailNotifications: true,
          smsNotifications: false,
          newsletter: true,
        },
        isActive: true,
        emailVerified: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp(),
      };

      await collection.doc(authUser.uid).set(userDoc);

      // Add to church member subcollections
      for (const membership of user.churchMemberships || []) {
        const churchRef = db.collection('churches').doc(membership.churchId);
        const churchDoc = await churchRef.get();

        if (churchDoc.exists) {
          await churchRef.collection('members').doc(authUser.uid).set({
            userId: authUser.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL || null,
            role: membership.role,
            status: membership.status || 'approved',
            joinedAt: FieldValue.serverTimestamp(),
            approvedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }

      count++;
    } catch (error) {
      console.error(`\n  Error seeding user ${user.email}: ${error.message}`);
    }
  }

  return count;
}

/**
 * Clear users from Firebase Auth and Firestore
 */
async function clearUsers(db, auth) {
  const collection = db.collection(COLLECTION);
  const snapshot = await collection.get();

  let count = 0;

  for (const doc of snapshot.docs) {
    try {
      // Delete from Firebase Auth
      await auth.deleteUser(doc.id);
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        console.error(`\n  Error deleting auth user ${doc.id}: ${error.message}`);
      }
    }

    // Delete Firestore document
    await doc.ref.delete();
    count++;
  }

  return count;
}

module.exports = { seedUsers, clearUsers };
