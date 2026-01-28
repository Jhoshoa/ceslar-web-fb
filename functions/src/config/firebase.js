/**
 * Firebase Admin SDK Configuration
 *
 * This module initializes the Firebase Admin SDK for use in Cloud Functions.
 * It provides access to Firestore, Auth, and Storage admin APIs.
 */

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { getStorage } = require('firebase-admin/storage');

// Initialize Firebase Admin SDK
// In Cloud Functions, this automatically uses the project's default service account
if (!admin.apps.length) {
  admin.initializeApp();
}

// Get Firestore instance with settings
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

// Get Auth instance
const auth = getAuth();

// Get Storage instance
const storage = getStorage();

// Helper to get server timestamp
const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;

// Helper for array operations
const arrayUnion = admin.firestore.FieldValue.arrayUnion;
const arrayRemove = admin.firestore.FieldValue.arrayRemove;

// Helper for increment
const increment = admin.firestore.FieldValue.increment;

// Helper for delete field
const deleteField = admin.firestore.FieldValue.delete;

module.exports = {
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
