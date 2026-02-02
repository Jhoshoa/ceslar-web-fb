/**
 * useAuth Hook
 *
 * Custom hook for Firebase authentication with Redux integration.
 * Provides:
 * - Authentication state
 * - Login/Register/Logout methods
 * - Role checking utilities
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  setUser,
  setLoading,
  setError,
  clearError,
  logout as logoutAction,
  selectUser,
  selectIsAuthenticated,
  selectIsInitialized,
  selectAuthLoading,
  selectAuthError,
  selectIsSystemAdmin,
  selectChurchRoles,
  selectPermissions,
  AuthUserState,
} from '../store/slices/auth.slice';
import { baseApi } from '../store/api/baseApi';
import type { AppDispatch } from '../store';
import type { SystemRole, ChurchRole, Permission } from '@ceslar/shared-types';

/**
 * Firebase Auth error codes
 */
type FirebaseAuthErrorCode =
  | 'auth/email-already-in-use'
  | 'auth/invalid-email'
  | 'auth/operation-not-allowed'
  | 'auth/weak-password'
  | 'auth/user-disabled'
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/invalid-credential'
  | 'auth/too-many-requests'
  | 'auth/popup-closed-by-user'
  | 'auth/network-request-failed'
  | 'auth/requires-recent-login'
  | 'auth/credential-already-in-use';

/**
 * Firebase Auth error with code
 */
interface FirebaseAuthError {
  code: FirebaseAuthErrorCode | string;
  message: string;
}

/**
 * Profile update data
 */
interface ProfileUpdateData {
  displayName?: string | null;
  photoURL?: string | null;
}

/**
 * Return type for useAuth hook
 */
export interface UseAuthReturn {
  // State
  user: AuthUserState | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
  isSystemAdmin: boolean;
  churchRoles: Record<string, ChurchRole>;
  permissions: Permission[];

  // Methods (primary names)
  loginWithEmail: (email: string, password: string) => Promise<FirebaseUser>;
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<FirebaseUser>;
  loginWithGoogle: () => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserProfile: (data: ProfileUpdateData) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  refreshToken: () => Promise<string | null>;

  // Method aliases (for backward compatibility with page components)
  signIn: (email: string, password: string) => Promise<FirebaseUser>;
  signUp: (email: string, password: string, displayName?: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  signUpWithGoogle: () => Promise<FirebaseUser>;
  sendVerificationEmail: () => Promise<void>;

  // Role checks
  hasRole: (role: SystemRole | ChurchRole) => boolean;
  hasChurchRole: (churchId: string, role: ChurchRole) => boolean;
  isChurchAdmin: (churchId: string) => boolean;
  isChurchMember: (churchId: string) => boolean;
  hasPermission: (permission: Permission) => boolean;

  // Actions
  clearError: () => void;
}

/**
 * useAuth Hook
 *
 * @returns Auth state and methods
 */
export function useAuth(): UseAuthReturn {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectIsInitialized);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isSystemAdmin = useSelector(selectIsSystemAdmin);
  const churchRoles = useSelector(selectChurchRoles);
  const permissions = useSelector(selectPermissions);

  /**
   * Initialize auth state listener
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get ID token with claims
          const tokenResult = await firebaseUser.getIdTokenResult(true);
          const claims = tokenResult.claims;

          // Build user object
          const userData: AuthUserState = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            phoneNumber: firebaseUser.phoneNumber,
            systemRole: (claims.systemRole as SystemRole) || 'user',
            churchRoles: (claims.churchRoles as Record<string, ChurchRole>) || {},
            permissions: (claims.permissions as Permission[]) || ['read:public'],
            createdAt: claims.createdAt as string | undefined,
          };

          dispatch(setUser(userData));
        } catch (err) {
          console.error('Error getting user claims:', err);
          // Still set user with basic info even if claims fail
          dispatch(setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            phoneNumber: firebaseUser.phoneNumber,
            systemRole: 'user',
            churchRoles: {},
            permissions: ['read:public'],
          }));
        }
      } else {
        dispatch(setUser(null));
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [dispatch]);

  /**
   * Login with email and password
   */
  const loginWithEmail = useCallback(
    async (email: string, password: string): Promise<FirebaseUser> => {
      dispatch(setLoading(true));
      dispatch(clearError());

      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
      } catch (err) {
        const authError = err as FirebaseAuthError;
        const errorMessage = getAuthErrorMessage(authError.code);
        dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    },
    [dispatch]
  );

  /**
   * Register with email and password
   */
  const registerWithEmail = useCallback(
    async (email: string, password: string, displayName = ''): Promise<FirebaseUser> => {
      dispatch(setLoading(true));
      dispatch(clearError());

      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);

        // Update profile with display name if provided
        if (displayName) {
          await updateProfile(result.user, { displayName });
        }

        // Send email verification
        await sendEmailVerification(result.user);

        return result.user;
      } catch (err) {
        const authError = err as FirebaseAuthError;
        const errorMessage = getAuthErrorMessage(authError.code);
        dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    },
    [dispatch]
  );

  /**
   * Login with Google
   */
  const loginWithGoogle = useCallback(async (): Promise<FirebaseUser> => {
    dispatch(setLoading(true));
    dispatch(clearError());

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (err) {
      const authError = err as FirebaseAuthError;
      const errorMessage = getAuthErrorMessage(authError.code);
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    }
  }, [dispatch]);

  /**
   * Logout
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await signOut(auth);
      dispatch(logoutAction());
      // Clear all cached API data
      dispatch(baseApi.util.resetApiState());
    } catch (err) {
      console.error('Logout error:', err);
      throw err;
    }
  }, [dispatch]);

  /**
   * Send password reset email
   */
  const resetPassword = useCallback(
    async (email: string): Promise<void> => {
      dispatch(clearError());

      try {
        await sendPasswordResetEmail(auth, email);
      } catch (err) {
        const authError = err as FirebaseAuthError;
        const errorMessage = getAuthErrorMessage(authError.code);
        dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    },
    [dispatch]
  );

  /**
   * Change password (requires reauthentication)
   */
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<void> => {
      dispatch(clearError());

      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('No authenticated user');
      }

      try {
        // Reauthenticate
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);

        // Update password
        await updatePassword(currentUser, newPassword);
      } catch (err) {
        const authError = err as FirebaseAuthError;
        const errorMessage = getAuthErrorMessage(authError.code);
        dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    },
    [dispatch]
  );

  /**
   * Update user profile
   */
  const updateUserProfile = useCallback(
    async (data: ProfileUpdateData): Promise<void> => {
      dispatch(clearError());

      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      try {
        await updateProfile(currentUser, data);
        // Force token refresh to get updated claims
        await currentUser.getIdToken(true);
      } catch (err) {
        const authError = err as FirebaseAuthError;
        const errorMessage = getAuthErrorMessage(authError.code);
        dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    },
    [dispatch]
  );

  /**
   * Resend email verification
   */
  const resendEmailVerification = useCallback(async (): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    await sendEmailVerification(currentUser);
  }, []);

  /**
   * Force refresh token and claims
   */
  const refreshToken = useCallback(async (): Promise<string | null> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    try {
      const tokenResult = await currentUser.getIdTokenResult(true);

      // Update Redux state with new claims
      dispatch(
        setUser({
          ...user,
          uid: user?.uid || currentUser.uid,
          email: user?.email || currentUser.email,
          emailVerified: user?.emailVerified ?? currentUser.emailVerified,
          systemRole: (tokenResult.claims.systemRole as SystemRole) || 'user',
          churchRoles: (tokenResult.claims.churchRoles as Record<string, ChurchRole>) || {},
          permissions: (tokenResult.claims.permissions as Permission[]) || ['read:public'],
        })
      );

      return tokenResult.token;
    } catch (err) {
      console.error('Token refresh error:', err);
      throw err;
    }
  }, [dispatch, user]);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (role: SystemRole | ChurchRole): boolean => {
      if (!user) return false;
      return (
        user.systemRole === role ||
        Object.values(user.churchRoles || {}).includes(role as ChurchRole)
      );
    },
    [user]
  );

  /**
   * Check if user has a specific role for a church
   */
  const hasChurchRole = useCallback(
    (churchId: string, role: ChurchRole): boolean => {
      if (!user) return false;
      if (user.systemRole === 'system_admin') return true;
      return user.churchRoles?.[churchId] === role;
    },
    [user]
  );

  /**
   * Check if user is admin for a church
   */
  const isChurchAdmin = useCallback(
    (churchId: string): boolean => {
      if (!user) return false;
      if (user.systemRole === 'system_admin') return true;
      const role = user.churchRoles?.[churchId];
      return role === 'admin' || role === 'pastor';
    },
    [user]
  );

  /**
   * Check if user is a member of a church
   */
  const isChurchMember = useCallback(
    (churchId: string): boolean => {
      if (!user) return false;
      if (user.systemRole === 'system_admin') return true;
      return !!user.churchRoles?.[churchId];
    },
    [user]
  );

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      const perms = user.permissions || [];
      return perms.includes(permission) || perms.includes('admin:all' as Permission);
    },
    [user]
  );

  // Memoize return object
  return useMemo(
    () => ({
      // State
      user,
      isAuthenticated,
      isInitialized,
      loading,
      error,
      isSystemAdmin,
      churchRoles,
      permissions,

      // Methods (primary names)
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      logout,
      resetPassword,
      changePassword,
      updateUserProfile,
      resendEmailVerification,
      refreshToken,

      // Method aliases (for backward compatibility with page components)
      signIn: loginWithEmail,
      signUp: registerWithEmail,
      signInWithGoogle: loginWithGoogle,
      signUpWithGoogle: loginWithGoogle,
      sendVerificationEmail: resendEmailVerification,

      // Role checks
      hasRole,
      hasChurchRole,
      isChurchAdmin,
      isChurchMember,
      hasPermission,

      // Actions
      clearError: () => dispatch(clearError()),
    }),
    [
      user,
      isAuthenticated,
      isInitialized,
      loading,
      error,
      isSystemAdmin,
      churchRoles,
      permissions,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      logout,
      resetPassword,
      changePassword,
      updateUserProfile,
      resendEmailVerification,
      refreshToken,
      hasRole,
      hasChurchRole,
      isChurchAdmin,
      isChurchMember,
      hasPermission,
      dispatch,
    ]
  );
}

/**
 * Convert Firebase auth error codes to user-friendly messages
 */
function getAuthErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/operation-not-allowed': 'This operation is not allowed.',
    'auth/weak-password': 'Password is too weak.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Login popup was closed.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/requires-recent-login': 'Please log in again to continue.',
    'auth/credential-already-in-use': 'This credential is already associated with another account.',
  };

  return errorMessages[code] || 'An authentication error occurred.';
}

export default useAuth;
