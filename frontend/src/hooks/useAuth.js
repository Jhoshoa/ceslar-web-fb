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
} from '../store/slices/auth.slice';
import { baseApi } from '../store/api/baseApi';

/**
 * useAuth Hook
 *
 * @returns {Object} Auth state and methods
 */
export function useAuth() {
  const dispatch = useDispatch();

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
      dispatch(setLoading(true));

      if (firebaseUser) {
        try {
          // Get ID token with claims
          const tokenResult = await firebaseUser.getIdTokenResult(true);
          const claims = tokenResult.claims;

          // Build user object
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            phoneNumber: firebaseUser.phoneNumber,
            systemRole: claims.systemRole || 'user',
            churchRoles: claims.churchRoles || {},
            permissions: claims.permissions || ['read:public'],
            createdAt: claims.createdAt,
          };

          dispatch(setUser(userData));
        } catch (err) {
          console.error('Error getting user claims:', err);
          dispatch(setError(err.message));
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
    async (email, password) => {
      dispatch(setLoading(true));
      dispatch(clearError());

      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
      } catch (err) {
        const errorMessage = getAuthErrorMessage(err.code);
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
    async (email, password, displayName = '') => {
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
        const errorMessage = getAuthErrorMessage(err.code);
        dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    },
    [dispatch]
  );

  /**
   * Login with Google
   */
  const loginWithGoogle = useCallback(async () => {
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
      const errorMessage = getAuthErrorMessage(err.code);
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    }
  }, [dispatch]);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
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
    async (email) => {
      dispatch(clearError());

      try {
        await sendPasswordResetEmail(auth, email);
      } catch (err) {
        const errorMessage = getAuthErrorMessage(err.code);
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
    async (currentPassword, newPassword) => {
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
        const errorMessage = getAuthErrorMessage(err.code);
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
    async (data) => {
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
        const errorMessage = getAuthErrorMessage(err.code);
        dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    },
    [dispatch]
  );

  /**
   * Resend email verification
   */
  const resendEmailVerification = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    await sendEmailVerification(currentUser);
  }, []);

  /**
   * Force refresh token and claims
   */
  const refreshToken = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    try {
      const tokenResult = await currentUser.getIdTokenResult(true);

      // Update Redux state with new claims
      dispatch(
        setUser({
          ...user,
          systemRole: tokenResult.claims.systemRole || 'user',
          churchRoles: tokenResult.claims.churchRoles || {},
          permissions: tokenResult.claims.permissions || ['read:public'],
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
    (role) => {
      if (!user) return false;
      return (
        user.systemRole === role ||
        Object.values(user.churchRoles || {}).includes(role)
      );
    },
    [user]
  );

  /**
   * Check if user has a specific role for a church
   */
  const hasChurchRole = useCallback(
    (churchId, role) => {
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
    (churchId) => {
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
    (churchId) => {
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
    (permission) => {
      if (!user) return false;
      const perms = user.permissions || [];
      return perms.includes(permission) || perms.includes('admin:all');
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
function getAuthErrorMessage(code) {
  const errorMessages = {
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
