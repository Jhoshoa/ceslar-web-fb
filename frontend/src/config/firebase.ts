/**
 * Firebase Client Configuration
 *
 * This module initializes Firebase SDK for the frontend application.
 * It handles both production Firebase and local emulators for development.
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import type { ChurchRole, Permission, SystemRole } from '@ceslar/shared-types';

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
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Initialize Analytics (only in production and if supported)
let analytics: Analytics | null = null;
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
  try {
    // eslint-disable-next-line no-console
    console.log('🔧 Connecting to Firebase Emulators...');

    // Auth Emulator
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });

    // Firestore Emulator
    connectFirestoreEmulator(db, 'localhost', 8080);

    // Storage Emulator
    connectStorageEmulator(storage, 'localhost', 9199);

    // eslint-disable-next-line no-console
    console.log('✅ Connected to Firebase Emulators');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to connect to Firebase Emulators:', error);
  }
}

/**
 * User claims structure
 */
export interface UserClaims {
  systemRole: SystemRole;
  churchRoles: Record<string, ChurchRole>;
  permissions: Permission[];
}

/**
 * Get current user's ID token
 *
 * @param forceRefresh - Force refresh the token
 * @returns The ID token or null if not authenticated
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
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
 * @param forceRefresh - Force refresh the token to get latest claims
 * @returns The user's claims or null if not authenticated
 */
export async function getUserClaims(forceRefresh = false): Promise<UserClaims | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const tokenResult = await user.getIdTokenResult(forceRefresh);
    return {
      systemRole: (tokenResult.claims.systemRole as SystemRole) || 'user',
      churchRoles: (tokenResult.claims.churchRoles as Record<string, ChurchRole>) || {},
      permissions: (tokenResult.claims.permissions as Permission[]) || ['read:public'],
    };
  } catch (error) {
    console.error('Error getting user claims:', error);
    return null;
  }
}

export { app, auth, db, storage, analytics };
export default app;
