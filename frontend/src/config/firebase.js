/**
 * Firebase Client Configuration
 *
 * This module initializes Firebase SDK for the frontend application.
 * It handles both production Firebase and local emulators for development.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics (only in production and if supported)
let analytics = null;
if (import.meta.env.PROD) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Connect to emulators in development
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

if (useEmulators) {
  console.log('🔧 Connecting to Firebase Emulators...');

  // Auth Emulator
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });

  // Firestore Emulator
  connectFirestoreEmulator(db, 'localhost', 8080);

  // Storage Emulator
  connectStorageEmulator(storage, 'localhost', 9199);

  console.log('✅ Connected to Firebase Emulators');
}

/**
 * Get current user's ID token
 *
 * @param {boolean} forceRefresh - Force refresh the token
 * @returns {Promise<string|null>} The ID token or null if not authenticated
 */
export async function getIdToken(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
}

/**
 * Get current user's claims
 *
 * @param {boolean} forceRefresh - Force refresh the token to get latest claims
 * @returns {Promise<Object|null>} The user's claims or null if not authenticated
 */
export async function getUserClaims(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const tokenResult = await user.getIdTokenResult(forceRefresh);
    return {
      systemRole: tokenResult.claims.systemRole || 'user',
      churchRoles: tokenResult.claims.churchRoles || {},
      permissions: tokenResult.claims.permissions || ['read:public'],
    };
  } catch (error) {
    console.error('Error getting user claims:', error);
    return null;
  }
}

export { app, auth, db, storage, analytics };
export default app;
