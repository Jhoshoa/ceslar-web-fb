/**
 * Firebase Auth Triggers
 *
 * This module handles authentication lifecycle events:
 * - onUserCreate: Sets default custom claims and creates Firestore user document
 * - onUserDelete: Cleans up user data from Firestore
 */

const functions = require('firebase-functions');
const { db, auth, serverTimestamp } = require('../config/firebase');

// Region configuration
const REGION = 'southamerica-east1';

/**
 * Default permissions for new users
 */
const DEFAULT_PERMISSIONS = ['read:public'];

/**
 * Trigger: When a new user is created in Firebase Auth
 *
 * This trigger:
 * 1. Sets default custom claims (systemRole, churchRoles, permissions)
 * 2. Creates a corresponding Firestore user document
 */
exports.onUserCreate = functions
  .region(REGION)
  .auth.user()
  .onCreate(async (user) => {
    console.log(`New user created: ${user.uid} (${user.email})`);

    try {
      // Set default custom claims
      const defaultClaims = {
        systemRole: 'user',
        churchRoles: {},
        permissions: DEFAULT_PERMISSIONS,
        createdAt: new Date().toISOString(),
      };

      await auth.setCustomUserClaims(user.uid, defaultClaims);
      console.log(`Set default claims for user: ${user.uid}`);

      // Create Firestore user document
      const userDocument = {
        email: user.email || null,
        displayName: user.displayName || '',
        firstName: '',
        lastName: '',
        photoURL: user.photoURL || null,
        phoneNumber: user.phoneNumber || null,
        systemRole: 'user',
        churchMemberships: [],
        registrationAnswers: [],
        preferences: {
          language: 'es',
          theme: 'light',
          emailNotifications: true,
          smsNotifications: false,
          newsletter: true,
        },
        isActive: true,
        emailVerified: user.emailVerified || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };

      await db.collection('users').doc(user.uid).set(userDocument);
      console.log(`Created Firestore document for user: ${user.uid}`);

      return { success: true, userId: user.uid };
    } catch (error) {
      console.error(`Error in onUserCreate for ${user.uid}:`, error);
      throw new functions.https.HttpsError('internal', 'Failed to initialize user');
    }
  });

/**
 * Trigger: When a user is deleted from Firebase Auth
 *
 * This trigger:
 * 1. Removes user from all church member subcollections
 * 2. Deletes the Firestore user document
 */
exports.onUserDelete = functions
  .region(REGION)
  .auth.user()
  .onDelete(async (user) => {
    console.log(`User deleted: ${user.uid} (${user.email})`);

    try {
      // Get user document to find church memberships
      const userDoc = await db.collection('users').doc(user.uid).get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        const memberships = userData.churchMemberships || [];

        // Remove from all church member subcollections
        const batch = db.batch();

        for (const membership of memberships) {
          const memberRef = db
            .collection('churches')
            .doc(membership.churchId)
            .collection('members')
            .doc(user.uid);

          batch.delete(memberRef);
        }

        // Delete user document
        batch.delete(db.collection('users').doc(user.uid));

        await batch.commit();
        console.log(`Cleaned up data for deleted user: ${user.uid}`);
      } else {
        // Just try to delete the user doc if it exists
        await db.collection('users').doc(user.uid).delete();
      }

      return { success: true, userId: user.uid };
    } catch (error) {
      console.error(`Error in onUserDelete for ${user.uid}:`, error);
      // Don't throw here - user is already deleted from Auth
      return { success: false, error: error.message };
    }
  });
