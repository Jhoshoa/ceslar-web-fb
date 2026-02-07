/**
 * Firebase Admin SDK Configuration
 *
 * This module initializes the Firebase Admin SDK for use in Cloud Functions.
 * It provides access to Firestore, Auth, and Storage admin APIs.
 */

import * as admin from 'firebase-admin';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
// In Cloud Functions, this automatically uses the project's default service account
if (!admin.apps.length) {
  admin.initializeApp();
}

// Get Firestore instance with settings
const db: Firestore = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

// Get Auth instance
const auth: Auth = getAuth();

// Get Storage instance
const storage: Storage = getStorage();

// Helper to get server timestamp
const serverTimestamp = FieldValue.serverTimestamp;

// Helper for array operations
const arrayUnion = FieldValue.arrayUnion;
const arrayRemove = FieldValue.arrayRemove;

// Helper for increment
const increment = FieldValue.increment;

// Helper for delete field
const deleteField = FieldValue.delete;

export {
  admin,
  db,
  auth,
  storage,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  deleteField,
};
